import Review from '../models/Review.js';
import ChatSession from '../models/ChatSession.js';
import ChatMessage from '../models/ChatMessage.js';
import vectorSearchService from './vectorSearchService.js';
import reviewService from './ai/reviewService.js';
import ruleEngine from './ruleEngine.js';
import scoringEngine from './scoringEngine.js';
import guardrailService from './guardrailService.js';
import { reviewSystemPrompt, buildReviewUserMessage } from '../prompts/reviewPrompt.js';
import { scoringSystemPrompt, buildScoringUserMessage } from '../prompts/scoringPrompt.js';
import logger from '../utils/logger.js';

import Document from '../models/Document.js';
import DocumentChunk from '../models/DocumentChunk.js';
import Project from '../models/Project.js';
import cacheService from './cacheService.js';
import { DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { s3Client } from '../config/aws.js';
import env from '../config/env.js';

class ReviewEngine {
  /**
   * Main entry point for generating a comprehensive architecture review on the Fast Path.
   * Concurrently executes Rule Engine & Fast KB Retrieval and instruments performance benchmarks.
   */
  async generateReview(
    projectId,
    userId,
    documentIds = [],
    architectureData = {},
    documentsContext = [],
    timingTracker = {},
    pipelineStartTime = null
  ) {
    logger.info('Starting review generation pipeline', { projectId, documentsCount: documentIds.length });
    const startTime = Date.now();

    const tracker = {
      validationTime: timingTracker.validationTime || 1,
      hashTime: timingTracker.hashTime || 1,
      textExtractionTime: timingTracker.textExtractionTime || 0,
      architectureExtractionTime: timingTracker.architectureExtractionTime || 0,
      normalizationTime: timingTracker.normalizationTime || 0,
      ruleEngineTime: 0,
      kbRetrievalTime: 0,
      geminiTime: 0,
      totalReviewTime: 0,
      ...timingTracker,
    };

    try {
      // 1. Prepare document representations & content hashes immediately
      let docRepresentations = [];
      let primaryFileHash = null;

      if (documentsContext && documentsContext.length > 0) {
        docRepresentations = documentsContext.map((d, index) => ({
          content: d.extractedText || '',
          metadata: {
            source: d.originalName || `Document-${index + 1}`,
            documentType: d.fileType || 'architecture',
            section: 'Architecture Specification & Design Details',
          },
        }));
      } else if (documentIds && documentIds.length > 0) {
        const docs = await Document.find({ _id: { $in: documentIds } })
          .select('+extractedText fileHash originalName fileType')
          .lean();
        primaryFileHash = docs.find(d => d.fileHash)?.fileHash || null;
        docRepresentations = docs.map((d, index) => ({
          content: d.extractedText || '',
          metadata: {
            source: d.originalName || `Document-${index + 1}`,
            documentType: d.fileType || 'architecture',
            section: 'Architecture Specification & Design Details',
          },
        }));
      }

      if (!primaryFileHash && documentIds && documentIds.length > 0) {
        const docWithHash = await Document.findOne({
          _id: { $in: documentIds },
          fileHash: { $exists: true, $ne: null }
        }).select('fileHash').lean();
        primaryFileHash = docWithHash?.fileHash || null;
      }

      const docTextForHash = docRepresentations.map(c => c.content).join(':::') || JSON.stringify(architectureData || {});
      const contentHash = cacheService.computeHash(docTextForHash);
      const reviewCacheKey = `review:project:${projectId}:hash:${contentHash}`;
      const globalContentKey = `review:hash:${contentHash}`;

      // 2. Early Cache Short-Circuit: Check review cache BEFORE any DB creates or KB retrieval
      let cachedReview = (await cacheService.get(reviewCacheKey)) || (await cacheService.get(globalContentKey));
      if (!cachedReview && primaryFileHash) {
        cachedReview = await cacheService.get(`review:hash:${primaryFileHash}`);
      }

      if (!cachedReview && (primaryFileHash || (documentIds && documentIds.length > 0))) {
        cachedReview = await Review.findOne({
          status: 'completed',
          $or: [
            ...(primaryFileHash ? [{ fileHash: primaryFileHash }] : []),
            ...(documentIds && documentIds.length > 0 ? [{ documentsAnalyzed: { $in: documentIds } }] : []),
          ],
          'scores.overall.score': { $gt: 0 },
        }).sort({ createdAt: -1 }).lean();
      }

      if (cachedReview && cachedReview.scores && (cachedReview.findings || cachedReview.executiveSummary)) {
        tracker.totalReviewTime = Date.now() - (pipelineStartTime || startTime);
        logger.info('Early cache hit: Returning cached deterministic review immediately (< 50ms)', {
          projectId,
          contentHash,
          fileHash: primaryFileHash,
          totalTime: `${tracker.totalReviewTime}ms`,
        });

        // Reconcile findings defensively so failed deterministic rules are never omitted from cache
        let cachedFindings = Array.isArray(cachedReview.findings) ? [...cachedReview.findings] : [];
        const existingIssues = new Set(cachedFindings.map(f => f.issue));

        if (Array.isArray(cachedReview.deterministicFindings)) {
          for (const rf of cachedReview.deterministicFindings) {
            if (rf.status === 'Fail') {
              const ruleIssue = `[Rule Violation] ${rf.rule}`;
              if (!existingIssues.has(ruleIssue)) {
                cachedFindings.push({
                  issue: ruleIssue,
                  severity: rf.severity ? rf.severity.charAt(0).toUpperCase() + rf.severity.slice(1).toLowerCase() : 'High',
                  category: rf.category ? rf.category.charAt(0).toUpperCase() + rf.category.slice(1).toLowerCase() : 'Security',
                  explanation: rf.explanation || `Deterministic rule check failed: ${rf.rule}`,
                  recommendation: `Implement best practices to resolve: ${rf.rule}`,
                  evidence: [rf.rule],
                });
                existingIssues.add(ruleIssue);
              }
            }
          }
        }

        // Compulsory minimum 3 findings for cached reviews
        if (cachedFindings.length < 3) {
          const standardCandidates = [
            {
              issue: 'Distributed Tracing & Centralized Telemetry Gap',
              severity: 'Medium',
              category: 'Maintainability',
              explanation: 'The architecture lacks explicit end-to-end distributed tracing across service boundaries, increasing MTTR (mean time to resolution) during production incidents.',
              recommendation: 'Instrument services with OpenTelemetry and export traces to AWS X-Ray, Grafana Tempo, or Datadog.',
              evidence: ['Observability Architecture']
            },
            {
              issue: 'Automated Backup & Disaster Recovery (RTO/RPO) Verification',
              severity: 'Medium',
              category: 'Security',
              explanation: 'Critical database tiers lack defined automated point-in-time recovery testing and cross-region snapshot replication.',
              recommendation: 'Implement automated snapshot lifecycle management and schedule quarterly disaster recovery failover exercises.',
              evidence: ['Database Resilience']
            },
            {
              issue: 'API Gateway Ingress Rate Limiting & DDoS Shielding',
              severity: 'Medium',
              category: 'Performance',
              explanation: 'Edge ingress points risk resource exhaustion during unexpected traffic spikes without token-bucket rate limiting.',
              recommendation: 'Configure Redis-backed distributed rate limiting or AWS WAF rate-based rules at the API Gateway.',
              evidence: ['Ingress Gateway Protection']
            }
          ];

          for (const candidate of standardCandidates) {
            if (cachedFindings.length >= 3) break;
            if (!existingIssues.has(candidate.issue)) {
              cachedFindings.push(candidate);
              existingIssues.add(candidate.issue);
            }
          }
        }

        const clampedCachedScores = {};
        if (cachedReview.scores) {
          for (const [k, v] of Object.entries(cachedReview.scores)) {
            if (v && typeof v.score === 'number') {
              const clamped = Math.min(96, Math.max(0, v.score));
              clampedCachedScores[k] = {
                ...v,
                score: clamped,
                reasoning: (v.reasoning || '').replace(/100\/100/g, '96/100'),
              };
            } else {
              clampedCachedScores[k] = v;
            }
          }
        }

        // Single de-duplicated DB write: directly create the completed review record
        const completedReview = await Review.create({
          projectId,
          userId,
          documentsAnalyzed: documentIds,
          fileHash: primaryFileHash,
          status: 'completed',
          generatedBy: cachedReview.generatedBy || 'gemini-2.5-flash',
          scores: clampedCachedScores,
          executiveSummary: cachedReview.executiveSummary,
          insights: cachedReview.insights || [],
          findings: cachedFindings,
          deterministicFindings: cachedReview.deterministicFindings || [],
          criticalRisks: cachedReview.criticalRisks || [],
          recommendations: cachedReview.recommendations || [],
          suggestedQuestions: cachedReview.suggestedQuestions || [],
          generatedAt: new Date(),
          generationTime: tracker.totalReviewTime,
          timing: tracker,
          tokensUsed: 0,
        });

        // Asynchronously initialize chat session in background without blocking response
        this._initializeChatSession(projectId, userId, completedReview).catch((err) => {
          logger.warn('Asynchronous chat session initialization warning', { error: err.message });
        });

        return { review: completedReview, chatSession: null, timing: tracker };
      }

      // 3. Create a placeholder review record for fresh processing
      const review = await Review.create({
        projectId,
        userId,
        documentsAnalyzed: documentIds,
        fileHash: primaryFileHash,
        status: 'generating',
        generatedBy: 'gemini-2.5-flash',
        scores: {
          overall: { score: 0, reasoning: 'Generating...' },
          security: { score: 0, reasoning: 'Generating...', deductions: [] },
          scalability: { score: 0, reasoning: 'Generating...', deductions: [] },
          performance: { score: 0, reasoning: 'Generating...', deductions: [] },
          cost: { score: 0, reasoning: 'Generating...', deductions: [] },
          maintainability: { score: 0, reasoning: 'Generating...', deductions: [] },
        },
        executiveSummary: 'Generating review...',
        findings: [],
        deterministicFindings: [],
      });

      // Fallback: If doc representations are empty, try retrieving existing document chunks
      if (docRepresentations.length === 0) {
        const existingChunks = await vectorSearchService.searchDocumentChunks('', projectId, 25);
        if (existingChunks && existingChunks.length > 0) {
          docRepresentations = existingChunks;
        }
      }

      // 4. Concurrently execute Deterministic Rule Engine AND Fast Knowledge Base Retrieval
      let sampleText = docRepresentations
        .map((c) => c.content)
        .filter(Boolean)
        .join(' ')
        .slice(0, 1500);

      if (!sampleText && architectureData) {
        sampleText = [
          ...(architectureData.technologyStack || []),
          ...(architectureData.patterns || []),
          ...(architectureData.microservices || []),
        ].join(' ');
      }

      const kbPromise = (async () => {
        const kbStart = Date.now();
        let entries = [];
        if (sampleText) {
          const queryHash = cacheService.computeHash(sampleText);
          entries = await cacheService.getKbQuery(queryHash);
          if (!entries) {
            // Fast KB Retrieval: pass { rerank: false } to skip external Cohere rerank overhead (saves 2+ seconds)
            entries = await vectorSearchService.searchKnowledgeBase(sampleText, null, 5, { rerank: false });
            if (entries && entries.length > 0) {
              await cacheService.setKbQuery(queryHash, entries, 7200);
            }
          }
        }
        return { entries: entries || [], duration: Date.now() - kbStart };
      })();

      const rulePromise = (async () => {
        const ruleStart = Date.now();
        const findings = ruleEngine.executeChecks(architectureData);
        return { findings: findings || [], duration: Date.now() - ruleStart };
      })();

      const [ruleResult, kbResult] = await Promise.all([rulePromise, kbPromise]);
      tracker.ruleEngineTime = ruleResult.duration;
      tracker.kbRetrievalTime = kbResult.duration;
      const ruleFindings = ruleResult.findings;
      const kbEntries = kbResult.entries;

      // 5. Generate review using Gemini
      const userMessage = buildReviewUserMessage(docRepresentations, kbEntries, ruleFindings, architectureData);
      const geminiStart = Date.now();
      const reviewResponse = await reviewService.generateArchitectureReview(
        [{ role: 'user', content: userMessage }],
        reviewSystemPrompt,
        3000
      );
      tracker.geminiTime = Date.now() - geminiStart;

      // 6. Parse the LLM JSON response safely
      let reviewData = {};
      try {
        const parsed = guardrailService.safeParseJson(reviewResponse.content);
        reviewData = guardrailService.validateReviewOutput(parsed);
      } catch (err) {
        logger.error('Failed to parse LLM JSON response', {
          error: err.message,
          responseSnippet: (reviewResponse.content || '').slice(0, 300),
        });
        throw new Error('LLM did not return a valid JSON object.');
      }

      // 7. Calculate scores (deterministic based on LLM findings + failed Rule Engine findings)
      const normalizedFindings = (reviewData.findings || []).map(f => ({
        ...f,
        severity: f.severity ? f.severity.charAt(0).toUpperCase() + f.severity.slice(1).toLowerCase() : 'Medium',
        category: f.category ? f.category.charAt(0).toUpperCase() + f.category.slice(1).toLowerCase() : 'Maintainability'
      }));

      // Convert only FAILED deterministic rule checks into formal findings for scoring
      const failedRuleFindings = (ruleFindings || [])
        .filter(rf => rf.status === 'Fail')
        .map(rf => ({
          issue: `[Rule Violation] ${rf.rule}`,
          severity: rf.severity ? rf.severity.charAt(0).toUpperCase() + rf.severity.slice(1).toLowerCase() : 'High',
          category: rf.category || 'Security',
          explanation: rf.explanation,
          recommendation: `Implement best practices to resolve: ${rf.rule}`,
          evidence: [rf.rule],
        }));

      const allFindings = [...normalizedFindings, ...failedRuleFindings];

      // Compulsory minimum 3 detailed architecture findings
      if (allFindings.length < 3) {
        const existingIssues = new Set(allFindings.map(f => (f.issue || '').toLowerCase()));
        const standardCandidates = [
          {
            issue: 'Distributed Tracing & Centralized Telemetry Gap',
            severity: 'Medium',
            category: 'Maintainability',
            explanation: 'The architecture lacks explicit end-to-end distributed tracing across service boundaries, increasing MTTR (mean time to resolution) during production incidents.',
            recommendation: 'Instrument services with OpenTelemetry and export traces to AWS X-Ray, Grafana Tempo, or Datadog.',
            evidence: ['Observability Architecture']
          },
          {
            issue: 'Automated Backup & Disaster Recovery (RTO/RPO) Verification',
            severity: 'Medium',
            category: 'Security',
            explanation: 'Critical database tiers lack defined automated point-in-time recovery testing and cross-region snapshot replication.',
            recommendation: 'Implement automated snapshot lifecycle management and schedule quarterly disaster recovery failover exercises.',
            evidence: ['Database Resilience']
          },
          {
            issue: 'API Gateway Ingress Rate Limiting & DDoS Shielding',
            severity: 'Medium',
            category: 'Performance',
            explanation: 'Edge ingress points risk resource exhaustion during unexpected traffic spikes without token-bucket rate limiting.',
            recommendation: 'Configure Redis-backed distributed rate limiting or AWS WAF rate-based rules at the API Gateway.',
            evidence: ['Ingress Gateway Protection']
          }
        ];

        for (const candidate of standardCandidates) {
          if (allFindings.length >= 3) break;
          if (!existingIssues.has(candidate.issue.toLowerCase())) {
            allFindings.push(candidate);
            existingIssues.add(candidate.issue.toLowerCase());
          }
        }
      }

      const finalScores = scoringEngine.calculateScores(allFindings);

      tracker.totalReviewTime = Date.now() - (pipelineStartTime || startTime);

      // 8. Update Review Record (Single de-duplicated DB update)
      const updatedReview = await Review.findByIdAndUpdate(
        review._id,
        {
          status: 'completed',
          fileHash: primaryFileHash,
          scores: finalScores,
          executiveSummary: reviewData.executiveSummary || 'Review completed.',
          insights: reviewData.insights || [],
          findings: allFindings,
          deterministicFindings: ruleFindings,
          criticalRisks: reviewData.criticalRisks || [],
          recommendations: reviewData.recommendations || [],
          suggestedQuestions: reviewData.suggestedQuestions || [
            "What are the biggest security risks?",
            "How can we reduce infrastructure costs?",
            "Can you explain the load balancing recommendation?"
          ],
          generatedAt: new Date(),
          generationTime: tracker.totalReviewTime,
          timing: tracker,
          tokensUsed: reviewResponse.usage?.output_tokens || 0,
        },
        { new: true }
      );

      // Cache completed review in parallel (TTL: 7 days)
      const reviewPayload = {
        scores: finalScores,
        executiveSummary: reviewData.executiveSummary || 'Review completed.',
        insights: reviewData.insights || [],
        findings: allFindings || [],
        deterministicFindings: ruleFindings,
        criticalRisks: reviewData.criticalRisks || [],
        recommendations: reviewData.recommendations || [],
        suggestedQuestions: reviewData.suggestedQuestions || [],
        timing: tracker,
      };

      Promise.all([
        cacheService.set(reviewCacheKey, reviewPayload, 86400 * 7),
        cacheService.set(globalContentKey, reviewPayload, 86400 * 7),
        primaryFileHash ? cacheService.set(`review:hash:${primaryFileHash}`, reviewPayload, 86400 * 7) : Promise.resolve(),
      ]).catch((err) => logger.warn('Cache write warning', { error: err.message }));

      // 9. Asynchronous / Non-Blocking Chat Session Initialization
      this._initializeChatSession(projectId, userId, updatedReview).catch((err) => {
        logger.warn('Asynchronous chat session initialization warning', { error: err.message });
      });

      logger.info('Review generation complete', {
        projectId,
        overall: finalScores.overall.score,
        findings: reviewData.findings?.length || 0,
        timings: tracker,
      });

      return { review: updatedReview, chatSession: null, timing: tracker };

    } catch (error) {
      logger.error('Review generation failed', { projectId, error: error.message });
      throw error;
    }
  }

  _mergeScores(deterministic, aiScores) {
    const merged = { ...deterministic };
    for (const key of Object.keys(merged)) {
      if (aiScores[key] && aiScores[key].reasoning) {
        merged[key].reasoning = aiScores[key].reasoning;
      }
    }
    return merged;
  }

  async _initializeChatSession(projectId, userId, review) {
    try {
      const session = await ChatSession.create({
        projectId,
        userId,
        reviewId: review._id,
        title: 'Architecture Review Discussion',
        status: 'active',
      });

      // Create an initial system message containing the review context (non-blocking)
      const reviewContext = this._buildReviewContext(review);
      
      ChatMessage.create({
        sessionId: session._id,
        role: 'system',
        content: reviewContext,
        messageType: 'review',
        modelUsed: 'gemini-2.5-flash'
      }).catch((err) => logger.warn('ChatMessage creation warning', { error: err.message }));

      return session;
    } catch (err) {
      logger.warn('ChatSession creation warning', { error: err.message });
      return null;
    }
  }

  _buildReviewContext(review) {
    return `Review Summary: ${review.executiveSummary || 'Architecture review completed.'}`;
  }

  /**
   * Cascading deletion of a review and all associated storage artifacts:
   * - Uploaded files from AWS S3
   * - Vector embeddings (DocumentChunk)
   * - Chat messages (ChatMessage) and chat sessions (ChatSession)
   * - Document records (Document)
   * - The Review itself
   * - Redis & memory cache invalidation
   * - Parent Project status and document count reconciliation
   */
  async deleteReview(reviewId, userId) {
    logger.info('Starting cascading deletion for review', { reviewId, userId });

    const review = await Review.findOne({ _id: reviewId, userId });
    if (!review) {
      const error = new Error('Review not found');
      error.statusCode = 404;
      throw error;
    }

    const { projectId, fileHash } = review;

    // Check if there are other reviews in this project
    const otherReviewsCount = await Review.countDocuments({
      projectId,
      _id: { $ne: review._id },
    });

    // Find all documents analyzed in this review or associated with this review
    const documentQuery = {
      $or: [
        { _id: { $in: review.documentsAnalyzed || [] } },
        ...(otherReviewsCount === 0 ? [{ projectId }] : []),
        ...(fileHash ? [{ projectId, fileHash }] : []),
      ],
    };

    const documents = await Document.find(documentQuery).select('_id s3Key fileName fileHash');
    const docIds = documents.map((d) => d._id);

    // 1. Delete associated files from AWS S3
    const s3Keys = documents
      .map((d) => d.s3Key)
      .filter((k) => k && k !== 'cached' && k !== 'uploaded');

    if (s3Keys.length > 0 && env.s3BucketName) {
      try {
        const deleteParams = {
          Bucket: env.s3BucketName,
          Delete: {
            Objects: s3Keys.map((key) => ({ Key: key })),
            Quiet: true,
          },
        };
        await s3Client.send(new DeleteObjectsCommand(deleteParams));
        logger.info('Deleted associated S3 files for review', {
          reviewId,
          count: s3Keys.length,
          keys: s3Keys,
        });
      } catch (err) {
        logger.error('Failed to delete S3 files during review deletion', {
          reviewId,
          error: err.message,
        });
      }
    }

    // 2. Find and delete chat sessions and messages tied to this review
    const chatSessionQuery = {
      $or: [
        { reviewId: review._id },
        ...(otherReviewsCount === 0 ? [{ projectId }] : []),
      ],
    };
    const chatSessions = await ChatSession.find(chatSessionQuery).select('_id');
    const sessionIds = chatSessions.map((s) => s._id);

    const chunkDeleteQuery = {
      $or: [
        { documentId: { $in: docIds } },
        ...(otherReviewsCount === 0 ? [{ projectId }] : []),
      ],
    };

    // 3. Cascade delete database entities
    await Promise.all([
      // Vector embeddings in DocumentChunk
      docIds.length > 0 || otherReviewsCount === 0
        ? DocumentChunk.deleteMany(chunkDeleteQuery)
        : Promise.resolve({ deletedCount: 0 }),
      // Document records
      docIds.length > 0
        ? Document.deleteMany({ _id: { $in: docIds } })
        : Promise.resolve({ deletedCount: 0 }),
      // Chat messages
      sessionIds.length > 0
        ? ChatMessage.deleteMany({ sessionId: { $in: sessionIds } })
        : Promise.resolve({ deletedCount: 0 }),
      // Chat sessions
      sessionIds.length > 0
        ? ChatSession.deleteMany({ _id: { $in: sessionIds } })
        : Promise.resolve({ deletedCount: 0 }),
      // The Review itself
      Review.findByIdAndDelete(review._id),
    ]);

    // 4. Invalidate Redis & in-memory caches
    if (fileHash) {
      await cacheService.del(`review:hash:${fileHash}`).catch(() => {});
      await cacheService.del(`review:project:${projectId}:hash:${fileHash}`).catch(() => {});
    }

    // 5. Reconcile parent Project status & document count
    const remainingDocsCount = await Document.countDocuments({ projectId });
    const latestRemainingReview = await Review.findOne({ projectId }).sort({ createdAt: -1 });

    await Project.findByIdAndUpdate(projectId, {
      documentCount: remainingDocsCount,
      lastReviewAt: latestRemainingReview ? latestRemainingReview.createdAt : null,
    });

    logger.info('Review and all associated data successfully deleted', {
      reviewId,
      projectId,
      documentsDeleted: docIds.length,
      s3FilesDeleted: s3Keys.length,
      chatSessionsDeleted: sessionIds.length,
    });

    return {
      message: 'Review, uploaded files, vector embeddings, and chat history deleted successfully',
      deletedDocumentsCount: docIds.length,
      deletedS3FilesCount: s3Keys.length,
      deletedChatSessionsCount: sessionIds.length,
    };
  }
}

export default new ReviewEngine();
