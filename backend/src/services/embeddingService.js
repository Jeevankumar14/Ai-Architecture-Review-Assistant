import { pipeline } from '@xenova/transformers';
import DocumentChunk from '../models/DocumentChunk.js';
import logger from '../utils/logger.js';

class EmbeddingService {
  constructor() {
    this.extractor = null;
    this.initPromise = this.init();
  }

  async init() {
    try {
      // Load BGE Large v1.5 from Hugging Face via transformers.js
      this.extractor = await pipeline('feature-extraction', 'Xenova/bge-large-en-v1.5', {
        quantized: true, // Use quantized weights for faster CPU inference
      });
      logger.info('BGE Large v1.5 embedding model loaded');
    } catch (error) {
      logger.error('Failed to load embedding model', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate embedding for a single text
   */
  async generateEmbedding(text) {
    await this.initPromise;
    
    try {
      const output = await this.extractor(text, { pooling: 'mean', normalize: true });
      return Array.from(output.data);
    } catch (error) {
      logger.error('Embedding generation failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate and store embeddings for document chunks
   */
  async embedAndStoreChunks(chunks, documentId, projectId) {
    logger.info('Generating embeddings for chunks', { count: chunks.length, documentId });

    const chunkDocs = [];
    
    // Process sequentially or in small batches to avoid blocking Node.js event loop
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await this.generateEmbedding(chunk.content);
      
      chunkDocs.push({
        documentId,
        projectId,
        type: 'document',
        chunkIndex: chunk.chunkIndex,
        content: chunk.content,
        tokenCount: chunk.tokenCount,
        embedding: embedding,
        metadata: chunk.metadata,
      });

      if (i % 10 === 0) {
        logger.debug(`Embedded ${i + 1}/${chunks.length} chunks`);
      }
    }

    const stored = await DocumentChunk.insertMany(chunkDocs);

    logger.info('Embeddings stored', { count: stored.length, documentId });
    return stored;
  }

  /**
   * Generate embedding for a single query (for vector search)
   */
  async embedQuery(text) {
    return this.generateEmbedding(text);
  }
}

export default new EmbeddingService();
