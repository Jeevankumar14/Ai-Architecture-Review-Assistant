import DocumentChunk from '../models/DocumentChunk.js';
import embeddingService from './embeddingService.js';
import rerankService from './rerankService.js';
import guardrailService from './guardrailService.js';
import logger from '../utils/logger.js';

class VectorSearchService {
  /**
   * Search document chunks for a project using hybrid similarity (Vector + Text Search) + Re-ranking
   */
  async searchDocumentChunks(queryText, projectId, limit = 10, options = {}) {
    const safeQueryText = guardrailService.sanitizeText(queryText, { maxLength: 1000 });
    logger.info('Starting document hybrid search', { projectId, query: safeQueryText.slice(0, 50) });
    
    // If query is empty, just return top chunks by index
    if (!safeQueryText || safeQueryText.trim() === '') {
      return DocumentChunk.find({ projectId, type: 'document' })
        .sort({ chunkIndex: 1 })
        .limit(limit)
        .lean();
    }

    const candidateLimit = Math.max(limit * 2, 8);
    let vectorResults = [];
    let textResults = [];

    // 1. Vector Search
    try {
      const queryEmbedding = await embeddingService.embedQuery(safeQueryText);
      const pipeline = [
        {
          $vectorSearch: {
            index: 'vector_index',
            path: 'embedding',
            queryVector: queryEmbedding,
            numCandidates: 150,
            limit: candidateLimit,
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
      vectorResults = await DocumentChunk.aggregate(pipeline);
    } catch (error) {
      logger.warn('Document vector search stage failed, relying on text search', { error: error.message });
    }

    // 2. Text Search (BM25-style keyword search)
    try {
      textResults = await DocumentChunk.find({
        projectId: projectId,
        type: 'document',
        $text: { $search: safeQueryText }
      })
      .select({
        content: 1,
        metadata: 1,
        chunkIndex: 1,
        documentId: 1,
        type: 1,
        score: { $meta: 'textScore' }
      })
      .sort({ score: { $meta: 'textScore' } })
      .limit(candidateLimit)
      .lean();
    } catch (error) {
      logger.warn('Document text search failed, relying on vector search / regex fallback', { error: error.message });
      // If both vector and text failed, do regex search as last resort
      if (vectorResults.length === 0) {
        vectorResults = await this._fallbackTextSearch(safeQueryText, { projectId, type: 'document' }, candidateLimit);
      }
    }

    // 3. Combine results using Reciprocal Rank Fusion (RRF)
    const combinedCandidates = this._rrfCombine(vectorResults, textResults);

    if (options.rerank === false) {
      return combinedCandidates.slice(0, candidateLimit);
    }

    // 4. Re-rank combined candidates
    try {
      const reranked = await rerankService.rerank(safeQueryText, combinedCandidates, limit);
      return reranked;
    } catch (error) {
      logger.error('Document re-ranking failed, returning top RRF candidates', { error: error.message });
      return combinedCandidates.slice(0, limit);
    }
  }

  /**
   * Search knowledge base using hybrid similarity + Re-ranking
   */
  async searchKnowledgeBase(queryText, projectId = null, limit = 10, options = {}) {
    const safeQueryText = guardrailService.sanitizeText(queryText, { maxLength: 1000 });
    logger.info('Starting knowledge base hybrid search', { projectId, query: safeQueryText.slice(0, 50) });

    // If query is empty, return some default chunks
    if (!safeQueryText || safeQueryText.trim() === '') {
      const filter = projectId ? { type: 'knowledge' } : { type: 'knowledge' };
      return DocumentChunk.find(filter).limit(limit).lean();
    }

    const candidateLimit = Math.max(limit * 2, 10);
    const filter = projectId 
      ? { $or: [{ type: "knowledge" }, { type: "document", projectId: projectId }] }
      : { type: "knowledge" };

    let vectorResults = [];
    let textResults = [];

    // 1. Vector Search
    try {
      const queryEmbedding = await embeddingService.embedQuery(safeQueryText);
      const pipeline = [
        {
          $vectorSearch: {
            index: 'vector_index',
            path: 'embedding',
            queryVector: queryEmbedding,
            numCandidates: 150,
            limit: candidateLimit,
            filter,
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
      vectorResults = await DocumentChunk.aggregate(pipeline);
    } catch (error) {
      logger.warn('KB vector search stage failed, relying on text search', { error: error.message });
    }

    // 2. Text Search (BM25-style keyword search)
    try {
      textResults = await DocumentChunk.find({
        ...filter,
        $text: { $search: safeQueryText }
      })
      .select({
        content: 1,
        metadata: 1,
        category: 1,
        type: 1,
        score: { $meta: 'textScore' }
      })
      .sort({ score: { $meta: 'textScore' } })
      .limit(candidateLimit)
      .lean();
    } catch (error) {
      logger.warn('KB text search failed, relying on vector search / regex fallback', { error: error.message });
      if (vectorResults.length === 0) {
        vectorResults = await this._fallbackTextSearch(safeQueryText, filter, candidateLimit);
      }
    }

    // 3. Combine using RRF
    const combinedCandidates = this._rrfCombine(vectorResults, textResults);

    if (options.rerank === false) {
      return combinedCandidates.slice(0, candidateLimit);
    }

    // 4. Re-rank
    try {
      const reranked = await rerankService.rerank(safeQueryText, combinedCandidates, limit);
      return reranked;
    } catch (error) {
      logger.error('KB re-ranking failed, returning top RRF candidates', { error: error.message });
      return combinedCandidates.slice(0, limit);
    }
  }

  /**
   * Combined search logic with dedicated quotas and re-ranking for project document chunks and knowledge base
   */
  async searchAll(queryText, projectId, options = {}) {
    const { docLimit = 8, kbLimit = 6, totalLimit = 10, minDocQuota = 6 } = options;

    const [docCandidates, kbCandidates] = await Promise.all([
      this.searchDocumentChunks(queryText, projectId, docLimit, { rerank: false }),
      this.searchKnowledgeBase(queryText, null, kbLimit, { rerank: false }),
    ]);

    if (docCandidates.length === 0 && kbCandidates.length === 0) {
      return { documentChunks: [], knowledgeBase: [], all: [] };
    }

    let rerankedDocs = [];
    let rerankedKb = [];

    try {
      if (docCandidates.length > 0 && kbCandidates.length > 0) {
        const [docs, kbs] = await Promise.all([
          rerankService.rerank(queryText, docCandidates, docLimit).catch(() => docCandidates.slice(0, docLimit)),
          rerankService.rerank(queryText, kbCandidates, kbLimit).catch(() => kbCandidates.slice(0, kbLimit)),
        ]);
        rerankedDocs = docs;
        rerankedKb = kbs;
      } else if (docCandidates.length > 0) {
        rerankedDocs = await rerankService.rerank(queryText, docCandidates, totalLimit).catch(() => docCandidates.slice(0, totalLimit));
      } else {
        rerankedKb = await rerankService.rerank(queryText, kbCandidates, totalLimit).catch(() => kbCandidates.slice(0, totalLimit));
      }
    } catch (error) {
      logger.error('searchAll rerank error, using unranked candidates', { error: error.message });
      rerankedDocs = docCandidates.slice(0, docLimit);
      rerankedKb = kbCandidates.slice(0, kbLimit);
    }

    // Allocate dedicated quota for project documents so they are never crowded out
    const targetDocCount = Math.min(rerankedDocs.length, Math.max(minDocQuota, totalLimit - rerankedKb.length));
    const finalDocs = rerankedDocs.slice(0, targetDocCount);
    const remainingSlots = Math.max(0, totalLimit - finalDocs.length);
    const finalKb = rerankedKb.slice(0, remainingSlots);

    return {
      documentChunks: finalDocs,
      knowledgeBase: finalKb,
      all: [...finalDocs, ...finalKb],
    };
  }

  /**
   * Reciprocal Rank Fusion (RRF) algorithm to merge two ranked list results
   */
  _rrfCombine(vectorResults, textResults, k = 60) {
    const scoreMap = new Map();

    const vectorList = vectorResults.map(r => r.toObject ? r.toObject() : r);
    const textList = textResults.map(r => r.toObject ? r.toObject() : r);

    const getDocId = (doc) => doc._id ? doc._id.toString() : doc.content;

    // Rank from Vector results
    vectorList.forEach((doc, rank) => {
      const docId = getDocId(doc);
      const score = 1 / (k + rank + 1);
      scoreMap.set(docId, { doc, score });
    });

    // Rank from Text/BM25 results
    textList.forEach((doc, rank) => {
      const docId = getDocId(doc);
      const score = 1 / (k + rank + 1);

      if (scoreMap.has(docId)) {
        const existing = scoreMap.get(docId);
        existing.score += score;
      } else {
        scoreMap.set(docId, { doc, score });
      }
    });

    // Sort descending by total score
    return Array.from(scoreMap.values())
      .sort((a, b) => b.score - a.score)
      .map(item => ({
        ...item.doc,
        rrfScore: item.score
      }));
  }

  /**
   * Fallback: regex/text search when indices are unavailable
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
