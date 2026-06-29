import DocumentChunk from '../models/DocumentChunk.js';
import embeddingService from './embeddingService.js';
import logger from '../utils/logger.js';

class VectorSearchService {
  /**
   * Search document chunks for a project using vector similarity
   */
  async searchDocumentChunks(queryText, projectId, limit = 10) {
    const queryEmbedding = await embeddingService.embedQuery(queryText);

    const pipeline = [
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: 150,
          limit: limit,
          filter: { 
            projectId: projectId,
            type: "document" 
          },
        },
      },
      {
        $project: {
          content: 1,
          metadata: 1,
          chunkIndex: 1,
          documentId: 1,
          type: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ];

    try {
      const results = await DocumentChunk.aggregate(pipeline);
      logger.debug('Document vector search complete', {
        query: queryText.slice(0, 100),
        results: results.length,
      });
      return results;
    } catch (error) {
      logger.error('Document vector search failed', { error: error.message });
      return this._fallbackTextSearch(queryText, { projectId, type: "document" }, limit);
    }
  }

  /**
   * Search knowledge base using vector similarity
   */
  async searchKnowledgeBase(queryText, projectId = null, limit = 10) {
    const queryEmbedding = await embeddingService.embedQuery(queryText);

    // Filter to either general knowledge chunks OR the user's specific project documents
    const filter = projectId 
      ? { $or: [{ type: "knowledge" }, { type: "document", projectId: projectId }] }
      : { type: "knowledge" };

    const pipeline = [
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'embedding',
          queryVector: queryEmbedding,
          numCandidates: 150,
          limit: limit,
          filter: filter,
        },
      },
      {
        $project: {
          content: 1,
          metadata: 1,
          category: 1,
          type: 1,
          score: { $meta: 'vectorSearchScore' },
        },
      },
    ];

    try {
      const results = await DocumentChunk.aggregate(pipeline);
      logger.debug('Combined KB/Doc vector search complete', {
        query: queryText.slice(0, 100),
        results: results.length,
      });
      return results;
    } catch (error) {
      logger.error('KB vector search failed', { error: error.message });
      return this._fallbackTextSearch(queryText, filter, limit);
    }
  }

  /**
   * Combined search logic (used if we need separate limits)
   */
  async searchAll(queryText, projectId, options = {}) {
    const { docLimit = 8, kbLimit = 5 } = options;

    const [docResults, kbResults] = await Promise.all([
      this.searchDocumentChunks(queryText, projectId, docLimit),
      this.searchKnowledgeBase(queryText, null, kbLimit),
    ]);

    return {
      documentChunks: docResults,
      knowledgeBase: kbResults,
    };
  }

  /**
   * Fallback: regex/text search when vector index unavailable
   */
  async _fallbackTextSearch(queryText, filterQuery, limit) {
    const escapeRegex = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const keywords = queryText.split(/\s+/).slice(0, 5).map(escapeRegex).join('|');
    
    return DocumentChunk.find({
      ...filterQuery,
      content: { $regex: keywords, $options: 'i' },
    })
      .limit(limit)
      .lean();
  }
}

export default new VectorSearchService();
