/**
 * Standalone BullMQ Background Embedding Worker Process
 * 
 * Runs independently from server.js to provide complete OS process and resource isolation.
 * Consumes 'embeddingQueue' jobs from Redis, generates Cohere cloud embeddings,
 * and persists vectors to MongoDB Atlas.
 * 
 * Usage:
 *   node worker.js
 *   (or) npm run worker
 */

import 'dotenv/config';
import { Worker } from 'bullmq';
import Redis from 'ioredis';
import connectDatabase from './src/config/database.js';
import env from './src/config/env.js';
import chunkingService from './src/services/chunkingService.js';
import embeddingService from './src/services/embeddingService.js';
import Document from './src/models/Document.js';
import logger from './src/utils/logger.js';

logger.info('Starting standalone BullMQ Background Worker...');

async function startWorker() {
  // 1. Connect to MongoDB Atlas
  try {
    await connectDatabase();
    logger.info('Worker: MongoDB connected successfully');
  } catch (err) {
    logger.error('Worker: Failed to connect to MongoDB', { error: err.message });
    process.exit(1);
  }

  // 2. Connect to Redis for BullMQ
  const redisUrl = env.redisUrl || process.env.REDIS_URL || 'redis://127.0.0.1:6379';
  const connection = new Redis(redisUrl, {
    maxRetriesPerRequest: null, // Required by BullMQ
    connectTimeout: 5000,
    retryStrategy: (times) => {
      const delay = Math.min(times * 500, 3000);
      logger.warn(`Worker: Redis reconnect attempt ${times}, waiting ${delay}ms`);
      return delay;
    },
  });

  connection.on('error', (err) => {
    logger.error('Worker: Redis connection error', { error: err.message });
  });

  connection.on('connect', () => {
    logger.info('Worker: Redis connection established');
  });

  // 3. Initialize BullMQ Worker for embeddingQueue
  const worker = new Worker(
    'embeddingQueue',
    async (job) => {
      const { documentId, projectId, extractedText, source, documentType } = job.data;
      logger.info('Worker: Processing embedding job', {
        jobId: job.id,
        documentId,
        projectId,
        textLength: extractedText?.length || 0,
      });

      if (!extractedText || !extractedText.trim()) {
        logger.warn('Worker: Empty text for document, skipping chunking', { documentId });
        await Document.findByIdAndUpdate(documentId, { ragReady: true, chunkCount: 0 });
        return { success: true, chunks: 0 };
      }

      // Step A: Semantic document chunking
      const chunks = chunkingService.chunkDocument(extractedText, {
        source: source || 'document',
        documentType: documentType || 'other',
      });

      logger.info(`Worker: Document split into ${chunks.length} chunks`, { documentId });

      // Step B: Generate Cohere embed-v4.0 (1024-dim) embeddings and store in MongoDB
      const stored = await embeddingService.embedAndStoreChunks(chunks, documentId, projectId);

      // Step C: Mark document as RAG ready
      await Document.findByIdAndUpdate(documentId, {
        ragReady: true,
        chunkCount: chunks.length,
      });

      logger.info('Worker: Embedding job finished successfully', {
        jobId: job.id,
        documentId,
        storedChunks: stored.length,
      });

      return { success: true, documentId, chunksCount: chunks.length };
    },
    {
      connection,
      concurrency: 2, // Concurrency 2 for cloud API calls is optimal
    }
  );

  // 4. Worker Lifecycle Listeners
  worker.on('ready', () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║   ⚙️   AI Architecture Review - Embedding Worker       ║
║   Queue: embeddingQueue (BullMQ + Redis)              ║
║   Model: Cohere embed-v4.0 (1024 dimensions)          ║
║   Status: LISTENING FOR JOBS                          ║
╚═══════════════════════════════════════════════════════╝
    `);
  });

  worker.on('completed', (job) => {
    logger.info('Worker: Job completed', { jobId: job.id });
  });

  worker.on('failed', (job, err) => {
    logger.error('Worker: Job failed', {
      jobId: job?.id,
      documentId: job?.data?.documentId,
      error: err.message,
      attemptsMade: job?.attemptsMade,
    });
  });

  worker.on('error', (err) => {
    logger.error('Worker: Unhandled worker error', { error: err.message });
  });

  // 5. Graceful Shutdown
  const shutdown = async (signal) => {
    logger.info(`Worker: Received ${signal}. Shutting down worker gracefully...`);
    try {
      await worker.close();
      await connection.quit();
      logger.info('Worker: Shutdown complete. Exiting.');
      process.exit(0);
    } catch (err) {
      logger.error('Worker: Error during shutdown', { error: err.message });
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startWorker().catch((err) => {
  logger.error('Worker: Fatal error during startup', { error: err.message });
  process.exit(1);
});
