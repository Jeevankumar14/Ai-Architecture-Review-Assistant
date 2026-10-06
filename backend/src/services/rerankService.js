import { getGeminiClient } from './ai/aiClient.js';
import env from '../config/env.js';
import logger from '../utils/logger.js';
import guardrailService from './guardrailService.js';

class RerankService {
  /**
   * Reranks a list of document chunks based on a query
   * @param {string} query The search query
   * @param {Array} documents Array of document/KB chunks
   * @param {number} limit Maximum number of documents to return
   * @returns {Promise<Array>} Reranked documents
   */
  async rerank(query, documents, limit = 5) {
    if (!documents || documents.length === 0) {
      return [];
    }

    const safeQuery = guardrailService.sanitizeText(query, { maxLength: 1000 });
    const safeDocuments = guardrailService.sanitizeDocumentsForModel(documents, { maxLength: 4000 });

    // If documents count is already <= limit, all candidates will be included;
    // preserve vector similarity score order and eliminate 3-second Cohere API overhead
    if (safeDocuments.length <= limit) {
      return safeDocuments.slice(0, limit);
    }

    const cohereApiKey = process.env.COHERE_API_KEY;

    if (cohereApiKey) {
      try {
        return await this._rerankWithCohere(safeQuery, safeDocuments, cohereApiKey, limit);
      } catch (err) {
        logger.error('Cohere reranking failed, falling back to Gemini', { error: err.message });
      }
    }

    // Fallback to Gemini Rerank
    try {
      return await this._rerankWithGemini(safeQuery, safeDocuments, limit);
    } catch (err) {
      logger.error('Gemini reranking failed, returning original order limited to limit', { error: err.message });
        return safeDocuments.slice(0, limit);
    }
  }

  /**
   * Rerank using Cohere Rerank API
   */
  async _rerankWithCohere(query, documents, apiKey, limit) {
    logger.info('Performing Cohere re-ranking', { count: documents.length });
    
    // Map documents to simple string array for Cohere
    const docsForCohere = documents.map(doc => doc.content);

    const response = await fetch('https://api.cohere.com/v1/rerank', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'rerank-english-v3.0',
        query: query,
        documents: docsForCohere,
        top_n: limit,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Cohere API error: ${response.status} - ${errText}`);
    }

    const result = await response.json();
    
    // Map the results back to the original documents with scores
    const reranked = result.results.map(item => {
      const doc = documents[item.index];
      return {
        ...doc,
        rerankScore: item.relevance_score,
      };
    });

    return reranked;
  }

  /**
   * Rerank using Gemini API with Structured Output
   */
  async _rerankWithGemini(query, documents, limit) {
    logger.info('Performing Gemini re-ranking fallback', { count: documents.length });
    
    const ai = getGeminiClient();
    
    // Keep list reasonable (e.g. top 20 documents max) to stay within limits and control latency
    const candidates = documents.slice(0, 20);

    const docItemsStr = candidates.map((doc, idx) => {
      const title = doc.metadata?.title || doc.category || 'N/A';
      return `[Chunk ID: ${idx}]\nTitle/Category: ${title}\nContent: ${doc.content}`;
    }).join('\n\n---\n\n');

    const prompt = `You are an expert search engine relevance model.
Task: Evaluate the relevance of the following document chunks to the search query.

Search Query: "${query}"

Candidates:
${docItemsStr}

Evaluate each candidate chunk on a relevance scale from 0.0 (completely irrelevant) to 1.0 (exactly answers the query).
Output a JSON object containing the ranked list of chunks sorted by score descending.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            rankings: {
              type: 'ARRAY',
              items: {
                type: 'OBJECT',
                properties: {
                  chunkId: { 
                    type: 'INTEGER',
                    description: 'The Chunk ID from the candidate list (0-indexed).' 
                  },
                  score: { 
                    type: 'NUMBER',
                    description: 'Relevance score between 0.0 and 1.0' 
                  },
                  reason: { 
                    type: 'STRING',
                    description: 'A brief 1-sentence reasoning for the score.' 
                  }
                },
                required: ['chunkId', 'score']
              }
            }
          },
          required: ['rankings']
        }
      }
    });

    const textResponse = typeof response.text === 'function' ? await response.text() : response.text;
    const data = JSON.parse(textResponse);
    const rankings = data.rankings || [];

    // Map rankings back to original documents
    const rerankedDocs = [];
    const seenIndices = new Set();

    for (const ranking of rankings) {
      const idx = ranking.chunkId;
      if (idx >= 0 && idx < candidates.length && !seenIndices.has(idx)) {
        seenIndices.add(idx);
        rerankedDocs.push({
          ...candidates[idx],
          rerankScore: ranking.score,
        });
      }
    }

    // Add any candidates that weren't ranked by Gemini at the end (with score 0)
    candidates.forEach((doc, idx) => {
      if (!seenIndices.has(idx)) {
        rerankedDocs.push({
          ...doc,
          rerankScore: 0,
        });
      }
    });

    return rerankedDocs.slice(0, limit);
  }
}

export default new RerankService();
