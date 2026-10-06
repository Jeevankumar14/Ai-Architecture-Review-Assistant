import Document from '../models/Document.js';
import Project from '../models/Project.js';
import Review from '../models/Review.js';
import documentProcessor from './documentProcessor.js';
import architectureParser from './architectureParser.js';
import architectureNormalizer from './architectureNormalizer.js';
import diagramProcessor from './diagramProcessor.js';
import reviewEngine from './reviewEngine.js';
import cacheService from './cacheService.js';
import queueService from './queueService.js';
import logger from '../utils/logger.js';

class PipelineOrchestrator {
  /**
   * Orchestrates multi-document processing and review generation on the Fast Path.
   * Tracks granular execution milestones for timing benchmarks.
   */
  async processDocuments(projectId, userId, documentIds, initialTimings = {}) {
    const pipelineStartTime = Date.now();
    logger.info('Pipeline started (Fast Path + Asynchronous Background Embeddings)', {
      projectId,
      documents: documentIds.length,
    });

    const processedDocIds = [];
    const documentsContext = [];
    let aggregatedArchitectureData = {};

    const timingTracker = {
      validationTime: initialTimings.validationTime || 1,
      hashTime: initialTimings.hashTime || 1,
      textExtractionTime: 0,
      architectureExtractionTime: 0,
      normalizationTime: 0,
      ruleEngineTime: 0,
      kbRetrievalTime: 0,
      geminiTime: 0,
      totalReviewTime: 0,
    };

    try {
      // 1. Process each document (Deterministic extraction + normalization)
      for (const docId of documentIds) {
        try {
          const docData = await this._processDocument(docId, projectId, timingTracker);
          processedDocIds.push(docId);
          documentsContext.push({
            docId,
            originalName: docData.doc.originalName,
            fileType: docData.doc.fileType,
            extractedText: docData.extractedText,
            architectureData: docData.architectureData,
          });

          // Aggregate parsed data across all documents in this batch
          const normStart = Date.now();
          aggregatedArchitectureData = architectureNormalizer.mergeAndNormalize(
            aggregatedArchitectureData,
            docData.architectureData
          );
          timingTracker.normalizationTime += Date.now() - normStart;
        } catch (error) {
          logger.error('Document processing failed', { docId, error: error.message });
          await Document.findByIdAndUpdate(docId, {
            status: 'failed',
            processingError: error.message,
          });
        }
      }

      if (processedDocIds.length === 0) throw new Error('All documents failed to process');

      await Project.findByIdAndUpdate(projectId, {
        documentCount: processedDocIds.length,
        lastReviewAt: new Date(),
      });

      // 2. Generate architecture review on the Fast Path with timing benchmarks
      const { review, chatSession, timing } = await reviewEngine.generateReview(
        projectId,
        userId,
        processedDocIds,
        aggregatedArchitectureData,
        documentsContext,
        timingTracker,
        pipelineStartTime
      );

      logger.info('Fast Review Pipeline complete', {
        projectId,
        reviewId: review._id,
        totalReviewTimeMs: timing?.totalReviewTime,
      });

      return { review, chatSession, processedDocuments: processedDocIds.length, timing };
    } catch (error) {
      await this._persistFailedReview(projectId, userId, error.message);
      logger.error('Pipeline failed', { projectId, error: error.message });
      throw error;
    }
  }

  async _processDocument(documentId, projectId, timingTracker) {
    const doc = await Document.findById(documentId);
    if (!doc) throw new Error(`Document not found: ${documentId}`);
    await Document.findByIdAndUpdate(documentId, { status: 'processing' });

    // 1. Text Extraction with Cache Support
    const extractStart = Date.now();
    let extractedText = await cacheService.getDocumentText(documentId);
    if (!extractedText && doc.fileHash) {
      const cached = await cacheService.getDocumentByHash(doc.fileHash);
      if (cached && cached.extractedText) {
        extractedText = cached.extractedText;
      }
    }

    if (!extractedText) {
      extractedText = await documentProcessor.extractText(doc.s3Key, doc.fileType);
      await cacheService.setDocumentText(documentId, extractedText);
      if (doc.fileHash) {
        await cacheService.setDocumentHash(doc.fileHash, { extractedText });
      }
    }
    timingTracker.textExtractionTime += Date.now() - extractStart;

    // 2. Visual Diagram Processing (if image)
    let ocrData = null;
    const visualTypes = ['png', 'jpeg', 'jpg', 'webp'];
    if (visualTypes.includes(doc.fileType.toLowerCase())) {
      ocrData = await diagramProcessor.processDiagramText(extractedText);
    }

    // 3. Fast Deterministic Architecture Parsing (Zero LLM call, < 25ms)
    const archStart = Date.now();
    const architectureData = await architectureParser.parseArchitecture(extractedText, ocrData, null);
    timingTracker.architectureExtractionTime += Date.now() - archStart;

    // 4. Metadata derivation
    const metadata = {
      cloudProvider: architectureData.cloudProvider || architectureData.cloudProviders?.[0] || 'Cloud / On-Premise',
      architectureStyle: architectureData.patterns?.[0] || 'Microservices / Distributed',
      programmingLanguages: architectureData.technologyStack || [],
      databases: architectureData.databases || [],
      components: architectureData.componentsList || architectureData.components?.map(c => c.name) || [],
    };

    // 5. Update document status to 'processed' immediately so UI polling finishes
    await Document.findByIdAndUpdate(documentId, {
      status: 'processed',
      extractedText,
      architectureData,
      metadata,
      textLength: extractedText.length,
    });

    // 6. Decouple background embedding job to BullMQ (non-blocking for Fast Review)
    queueService
      .enqueueEmbeddingJob({
        documentId,
        projectId,
        extractedText,
        source: doc.originalName,
        documentType: metadata?.documentType || doc.metadata?.documentType || 'other',
      })
      .catch((err) => logger.warn('Background embedding enqueue warning', { error: err.message }));

    logger.info('Document processed on fast path and embedding enqueued to BullMQ', { documentId });
    return { architectureData, extractedText, doc };
  }

  async _persistFailedReview(projectId, userId, message) {
    const fallbackScores = {
      overall: { score: 0, reasoning: message || 'Review generation failed.', deductions: [] },
      security: { score: 0, reasoning: message || 'Review generation failed.', deductions: [] },
      scalability: { score: 0, reasoning: message || 'Review generation failed.', deductions: [] },
      performance: { score: 0, reasoning: message || 'Review generation failed.', deductions: [] },
      cost: { score: 0, reasoning: message || 'Review generation failed.', deductions: [] },
      maintainability: { score: 0, reasoning: message || 'Review generation failed.', deductions: [] },
    };

    const existingFailedOrGenerating = await Review.findOne({
      projectId,
      userId,
      status: { $in: ['generating', 'failed'] },
    }).sort({ createdAt: -1 });

    if (existingFailedOrGenerating) {
      await Review.findByIdAndUpdate(existingFailedOrGenerating._id, {
        status: 'failed',
        scores: fallbackScores,
        executiveSummary: 'Review generation failed. Please re-upload the document or try again.',
        findings: [],
        criticalRisks: [message || 'Unknown pipeline error'],
      });
    }
  }
}

export default new PipelineOrchestrator();
