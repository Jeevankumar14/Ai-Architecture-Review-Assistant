import DocumentChunk from '../models/DocumentChunk.js';
import env from '../config/env.js';
import logger from '../utils/logger.js';

class EmbeddingService {
  constructor() {
    this.model = env.cohereEmbeddingModel || 'embed-v4.0';
    this.dimension = env.cohereEmbeddingDimension || 1024;
    this.endpoint = 'https://api.cohere.com/v2/embed';
  }

  /**
   * Helper to execute API call to Cohere Embed v2 with retry on rate limits
   */
  async _callCohereApi(texts, inputType = 'search_document', retries = 3) {
    const apiKey = env.cohereApiKey || process.env.COHERE_API_KEY;
    if (!apiKey) {
      throw new Error('COHERE_API_KEY is not configured in environment variables.');
    }

    const payload = {
      model: this.model,
      texts,
      input_type: inputType,
      embedding_types: ['float'],
      output_dimension: this.dimension,
    };

    let attempt = 0;
    while (attempt < retries) {
      attempt++;
      try {
        const response = await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        if (response.status === 429) {
          const waitTime = Math.pow(2, attempt) * 1000 + Math.floor(Math.random() * 500);
          logger.warn(`Cohere API rate limited (429). Retrying in ${waitTime}ms (attempt ${attempt}/${retries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Cohere API error: ${response.status} ${response.statusText} - ${errText}`);
        }

        const data = await response.json();
        const embeddings = data.embeddings?.float || data.embeddings;

        if (!Array.isArray(embeddings) || embeddings.length === 0) {
          throw new Error('Cohere API returned invalid or empty embeddings payload.');
        }

        // Verify returned dimension matches the expected 1024
        const actualDim = embeddings[0].length;
        if (actualDim !== this.dimension) {
          logger.warn(`Embedding dimension notice: expected ${this.dimension}, received ${actualDim}`);
        }

        return embeddings;
      } catch (err) {
        if (attempt >= retries) {
          logger.error('Cohere embedding request failed after retries', { error: err.message });
          throw err;
        }
        const waitTime = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  /**
   * Generate embedding for a single text
   * @param {string} text - Text to embed
   * @param {string} [inputType='search_document'] - 'search_document' or 'search_query'
   * @returns {Promise<number[]>} 1024-dimensional embedding vector
   */
  async generateEmbedding(text, inputType = 'search_document') {
    const cleanText = (text || '').trim();
    if (!cleanText) {
      return new Array(this.dimension).fill(0);
    }

    const embeddings = await this._callCohereApi([cleanText], inputType);
    return embeddings[0];
  }

  /**
   * Generate embedding for a single query (for vector search)
   * @param {string} text - Search query
   * @returns {Promise<number[]>} 1024-dimensional query vector
   */
  async embedQuery(text) {
    return this.generateEmbedding(text, 'search_query');
  }

  async generateQueryEmbedding(text) {
    return this.embedQuery(text);
  }

  async generateBatchEmbeddings(texts, inputType = 'search_document') {
    return this.generateEmbeddingsBatch(texts, inputType);
  }

  /**
   * Generate embeddings for multiple texts using batching (up to 96 chunks per request)
   * @param {string[]} texts - Array of texts
   * @param {string} [inputType='search_document']
   * @returns {Promise<number[][]>} Array of embedding vectors
   */
  async generateEmbeddingsBatch(texts, inputType = 'search_document') {
    if (!Array.isArray(texts) || texts.length === 0) return [];

    const BATCH_SIZE = 96; // Cohere allows up to 96 texts per request
    const allEmbeddings = [];

    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const batch = texts.slice(i, i + BATCH_SIZE);
      const batchEmbeddings = await this._callCohereApi(batch, inputType);
      allEmbeddings.push(...batchEmbeddings);
      logger.debug(`Cohere embedded batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(texts.length / BATCH_SIZE)}`);
    }

    return allEmbeddings;
  }

  /**
   * Generate and store embeddings for document chunks using Cohere cloud API
   * @param {Array} chunks - Document chunks
   * @param {string} documentId - Document ID
   * @param {string} projectId - Project ID
   */
  async embedAndStoreChunks(chunks, documentId, projectId) {
    if (!chunks || chunks.length === 0) {
      return [];
    }

    logger.info('Generating Cohere embed-v4.0 (1024-dim) embeddings for chunks', { count: chunks.length, documentId });

    const chunkTexts = chunks.map(c => c.content);
    const embeddings = await this.generateEmbeddingsBatch(chunkTexts, 'search_document');

    const chunkDocs = chunks.map((chunk, index) => ({
      documentId,
      projectId,
      type: 'document',
      chunkIndex: chunk.chunkIndex ?? index,
      content: chunk.content,
      tokenCount: chunk.tokenCount || 0,
      embedding: embeddings[index],
      metadata: {
        ...(chunk.metadata || {}),
        embeddingModel: this.model,
        embeddingDimension: this.dimension,
      },
    }));

    try {
      const stored = await DocumentChunk.insertMany(chunkDocs);
      logger.info('Cohere embeddings stored successfully in MongoDB', { count: stored.length, documentId });
      return stored;
    } catch (error) {
      logger.warn('DocumentChunk storage warning, continuing', {
        documentId,
        error: error.message,
      });
      return chunkDocs;
    }
  }
}

export default new EmbeddingService();
