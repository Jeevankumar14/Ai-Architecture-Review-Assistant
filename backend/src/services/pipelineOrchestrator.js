import Document from '../models/Document.js';
import Project from '../models/Project.js';
import documentProcessor from './documentProcessor.js';
import ocrService from './ocrService.js';
import metadataExtractor from './metadataExtractor.js';
import architectureParser from './architectureParser.js';
import diagramProcessor from './diagramProcessor.js';
import chunkingService from './chunkingService.js';
import embeddingService from './embeddingService.js';
import reviewEngine from './reviewEngine.js';
import logger from '../utils/logger.js';

class PipelineOrchestrator {
  async processDocuments(projectId, userId, documentIds) {
    logger.info('Pipeline started', { projectId, documents: documentIds.length });
    const processedDocIds = [];
    let aggregatedArchitectureData = {};

    try {
      // 1. Process each document
      for (const docId of documentIds) {
        try {
          const docData = await this._processDocument(docId, projectId);
          processedDocIds.push(docId);
          // Aggregate parsed data across all documents in this upload batch
          aggregatedArchitectureData = this._mergeData(aggregatedArchitectureData, docData);
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

      // 2. Generate architecture review automatically
      const { review, chatSession } = await reviewEngine.generateReview(
        projectId,
        userId,
        processedDocIds,
        aggregatedArchitectureData // Passed to Rule Engine
      );

      logger.info('Pipeline complete', { projectId, reviewId: review._id });
      return { review, chatSession, processedDocuments: processedDocIds.length };
    } catch (error) {
      logger.error('Pipeline failed', { projectId, error: error.message });
      throw error;
    }
  }

  async _processDocument(documentId, projectId) {
    const doc = await Document.findById(documentId);
    if (!doc) throw new Error(`Document not found: ${documentId}`);
    await Document.findByIdAndUpdate(documentId, { status: 'processing' });

    // 1. Text Extraction (Now handles both text documents and image OCR)
    let extractedText = await documentProcessor.extractText(doc.s3Key, doc.fileType);
    let ocrData = null;

    // 2. Visual Diagram Processing
    const visualTypes = ['png', 'jpeg', 'jpg', 'webp']; 
    if (visualTypes.includes(doc.fileType.toLowerCase())) {
      ocrData = await diagramProcessor.processDiagramText(extractedText);
    }

    // 3. Metadata Extraction
    const metadata = await metadataExtractor.extractMetadata(extractedText);

    // 4. Architecture Parsing
    const architectureData = await architectureParser.parseArchitecture(extractedText, ocrData, metadata);

    // 5. Chunking
    const chunks = chunkingService.chunkDocument(extractedText, {
      source: doc.originalName,
      documentType: doc.metadata?.documentType || 'other',
    });

    // 6. Embeddings via BGE Large
    await embeddingService.embedAndStoreChunks(chunks, documentId, projectId);

    // 7. Update document status
    await Document.findByIdAndUpdate(documentId, {
      status: 'processed',
      extractedText,
      architectureData, // Save structured data
      metadata,
      textLength: extractedText.length,
      chunkCount: chunks.length,
    });

    logger.info('Document processed', { documentId, chunks: chunks.length });
    return architectureData;
  }

  _mergeData(existing, incoming) {
    return {
      microservices: [...new Set([...(existing.microservices || []), ...(incoming.microservices || [])])],
      dependencies: [...new Set([...(existing.dependencies || []), ...(incoming.dependencies || [])])],
      patterns: [...new Set([...(existing.patterns || []), ...(incoming.patterns || [])])],
      technologyStack: [...new Set([...(existing.technologyStack || []), ...(incoming.technologyStack || [])])],
    };
  }
}

export default new PipelineOrchestrator();
