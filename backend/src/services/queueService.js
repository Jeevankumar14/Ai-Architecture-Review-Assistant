import EventEmitter from 'events';
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import logger from '../utils/logger.js';
import env from '../config/env.js';
import chunkingService from './chunkingService.js';
import embeddingService from './embeddingService.js';
import Document from '../models/Document.js';

class QueueService extends EventEmitter {
  constructor() {
    super();
    this.isBullMqActive = false;
    this.bullEmbeddingQueue = null;
    this.bullReviewQueue = null;
    this.bullEmbeddingWorker = null;
    this.bullReviewWorker = null;
    this.redisClient = null;

    // In-Memory Fallback structures
    this.memoryJobs = new Map();
    this.memoryEmbeddingQueue = [];
    this.memoryReviewQueue = [];
    this.isProcessingEmbeddings = false;

    this._initQueues();
  }

  async _initQueues() {
    const redisUrl = env.redisUrl || process.env.REDIS_URL || 'redis://127.0.0.1:6379';

    try {
      this.redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: null, // Required by BullMQ
        connectTimeout: 2000,
        retryStrategy: (times) => {
          if (times > 3) return null;
          return Math.min(times * 200, 1000);
        },
        lazyConnect: true,
        enableOfflineQueue: false,
      });

      this.redisClient.on('error', (err) => {
        if (this.isBullMqActive) {
          logger.warn('QueueService: Redis connection lost. Falling back to in-memory queues.', { error: err.message });
        }
        this.isBullMqActive = false;
      });

      await this.redisClient.connect();

      // Redis is available! Initialize BullMQ Producer Queues
      // NOTE: Worker processing is strictly isolated to worker.js OS process
      const connection = this.redisClient;
      this.bullEmbeddingQueue = new Queue('embeddingQueue', { connection });
      this.bullReviewQueue = new Queue('reviewQueue', { connection });

      this.isBullMqActive = true;
      logger.info('QueueService: BullMQ & Redis queues initialized successfully (embeddingQueue, reviewQueue). Worker runs in worker.js.');
    } catch (err) {
      this.isBullMqActive = false;
      logger.info('QueueService: Redis offline or not running. Operating with high-performance In-Memory job queue.');
    }
  }

  /**
   * Enqueue a background document embedding job
   */
  async enqueueEmbeddingJob({ documentId, projectId, extractedText, source, documentType }) {
    const jobPayload = { documentId, projectId, extractedText, source, documentType };

    if (this.isBullMqActive && this.bullEmbeddingQueue) {
      try {
        const job = await this.bullEmbeddingQueue.add('embed-document', jobPayload, {
          removeOnComplete: 100,
          removeOnFail: 200,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        });
        logger.info('Enqueued background embedding job via BullMQ', { jobId: job.id, documentId });
        return { id: job.id, type: 'bullmq', status: 'queued' };
      } catch (err) {
        logger.warn('BullMQ enqueue failed, routing to in-memory queue', { error: err.message });
      }
    }

    // In-memory fallback
    const jobId = `embed_${documentId}_${Date.now()}`;
    const memJob = {
      id: jobId,
      type: 'embedding',
      data: jobPayload,
      status: 'queued',
      progress: 0,
      createdAt: new Date(),
    };

    this.memoryJobs.set(jobId, memJob);
    this.memoryEmbeddingQueue.push(memJob);
    logger.info('Enqueued background embedding job via In-Memory Queue', { jobId, documentId });

    this._triggerMemoryEmbeddingWorker();
    return memJob;
  }

  /**
   * Enqueue a review job
   */
  async enqueueReviewJob({ projectId, userId, documentIds, architectureData }) {
    const jobPayload = { projectId, userId, documentIds, architectureData };

    if (this.isBullMqActive && this.bullReviewQueue) {
      try {
        const job = await this.bullReviewQueue.add('generate-review', jobPayload, {
          removeOnComplete: 50,
          removeOnFail: 100,
        });
        logger.info('Enqueued review job via BullMQ', { jobId: job.id, projectId });
        return { id: job.id, type: 'bullmq', status: 'queued' };
      } catch (err) {
        logger.warn('BullMQ review enqueue failed, routing to in-memory queue', { error: err.message });
      }
    }

    const jobId = `review_${projectId}_${Date.now()}`;
    const memJob = {
      id: jobId,
      type: 'review',
      data: jobPayload,
      status: 'queued',
      progress: 0,
      createdAt: new Date(),
    };

    this.memoryJobs.set(jobId, memJob);
    this.memoryReviewQueue.push(memJob);
    return memJob;
  }

  /**
   * Internal job processor shared between BullMQ Worker and In-Memory Worker
   */
  async _processEmbeddingJob(data) {
    const { documentId, projectId, extractedText, source, documentType } = data;

    // 1. Chunk document
    const chunks = chunkingService.chunkDocument(extractedText, {
      source: source || 'document',
      documentType: documentType || 'other',
    });

    // 2. Generate and store BGE Large embeddings
    await embeddingService.embedAndStoreChunks(chunks, documentId, projectId);

    // 3. Mark document as RAG ready
    await Document.findByIdAndUpdate(documentId, {
      ragReady: true,
      chunkCount: chunks.length,
    });

    logger.info('Document chunks successfully embedded and stored', { documentId, chunks: chunks.length });
    return chunks.length;
  }

  /**
   * In-Memory Worker loop with concurrency = 1
   */
  async _triggerMemoryEmbeddingWorker() {
    if (this.isProcessingEmbeddings || this.memoryEmbeddingQueue.length === 0) {
      return;
    }

    this.isProcessingEmbeddings = true;

    setImmediate(async () => {
      while (this.memoryEmbeddingQueue.length > 0) {
        const job = this.memoryEmbeddingQueue.shift();
        job.status = 'active';
        job.startedAt = new Date();
        this.emit('job:started', job);

        try {
          await this._processEmbeddingJob(job.data);
          job.status = 'completed';
          job.completedAt = new Date();
          job.progress = 100;
          this.emit('job:completed', job);
        } catch (error) {
          job.status = 'failed';
          job.error = error.message;
          job.failedAt = new Date();
          this.emit('job:failed', job);
        }

        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      this.isProcessingEmbeddings = false;
    });
  }

  /**
   * Get job status
   */
  getJob(jobId) {
    return this.memoryJobs.get(jobId) || null;
  }

  /**
   * Status summary
   */
  getStatus() {
    const embedLen = this.memoryEmbeddingQueue.length;
    const reviewLen = this.memoryReviewQueue.length;
    return {
      engine: this.isBullMqActive ? 'BullMQ (Redis)' : 'In-Memory Async Worker',
      isBullMqActive: this.isBullMqActive,
      embeddingQueueLength: embedLen,
      reviewQueueLength: reviewLen,
      memoryEmbeddingQueueLength: embedLen,
      memoryReviewQueueLength: reviewLen,
      isProcessingEmbeddings: this.isProcessingEmbeddings,
      totalMemoryJobsTracked: this.memoryJobs.size,
    };
  }
}

export default new QueueService();
