import chatService from './ai/chatService.js';
import env from '../config/env.js';
import vectorSearchService from './vectorSearchService.js';
import ChatSession from '../models/ChatSession.js';
import ChatMessage from '../models/ChatMessage.js';
import Project from '../models/Project.js';
import Review from '../models/Review.js';
import Document from '../models/Document.js';
import logger from '../utils/logger.js';
import guardrailService from './guardrailService.js';
import { buildChatSystemPrompt, buildChatUserMessage } from '../prompts/chatPrompt.js';

class ChatEngine {
  /**
   * Process an incoming user message and stream back a response from the configured chat model
   */
  async *processMessage(sessionId, userId, content) {
    const startTime = Date.now();
    logger.info('Processing chat message', { sessionId, userId });

    const session = await ChatSession.findOne({ _id: sessionId, userId });
    if (!session) {
      throw new Error('Chat session not found');
    }

    // 1. Save user message immediately
    await ChatMessage.create({
      sessionId,
      role: 'user',
      content,
      messageType: 'text',
    });

    // 2. Retrieve conversation history (latest 10 messages in chronological order)
    const recentMessages = await ChatMessage.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();
    
    // Filter out polluted guardrail-regurgitation turns if they exist in legacy history
    const cleanHistory = recentMessages.reverse().filter(m => {
      if (m.role === 'assistant' && (
        m.content.includes('Scope restriction') || 
        m.content.includes('Scope enforcement') || 
        m.content.includes('Score integrity') || 
        m.content.includes('Scope‑restriction') || 
        m.content.includes('Scope‑bound')
      )) {
        return false;
      }
      return true;
    });

    // 3. RAG Retrieval via Single Unified Vector Search + Review & Document Context Fallback
    const [review, rawDocs, searchResults] = await Promise.all([
      Review.findOne({
        $or: [
          ...(session.reviewId ? [{ _id: session.reviewId }] : []),
          { projectId: session.projectId },
        ],
        status: 'completed',
      }).sort({ createdAt: -1 }).lean(),
      Document.find({ projectId: session.projectId }).select('+extractedText originalName fileType ragReady status').lean(),
      vectorSearchService.searchAll(content, session.projectId, { docLimit: 8, kbLimit: 6, totalLimit: 10, minDocQuota: 6 }).catch((err) => {
        logger.error('Vector search failed in chatEngine', { error: err.message });
        return { documentChunks: [], knowledgeBase: [], all: [] };
      }),
    ]);

    let projectDocEntries = searchResults.documentChunks || [];
    const kbEntries = searchResults.knowledgeBase || [];

    // Check if documents are still being indexed in background
    const pendingDocs = (rawDocs || []).filter(d => !d.ragReady && d.status === 'processing');
    const isIndexing = pendingDocs.length > 0;

    if (!projectDocEntries || projectDocEntries.length === 0) {
      if (rawDocs && rawDocs.length > 0) {
        projectDocEntries = rawDocs.map(d => ({
          content: (d.extractedText || '').slice(0, 10000),
          metadata: {
            source: d.originalName || 'Architecture Document',
            section: isIndexing ? 'Indexing in progress (Partial extract)' : 'Architecture Document Extract',
          }
        }));
      }
    }

    const contextEntries = [...(projectDocEntries || []), ...(kbEntries || [])];
    const citations = contextEntries.map(entry => entry.metadata?.source || entry.category || 'Architecture Document');

    const formattedSources = Array.from(
      new Map(
        contextEntries.slice(0, 5).map(c => [
          c.metadata?.source || c.category || 'Architecture Specification',
          {
            documentName: c.metadata?.source || c.category || 'Architecture Specification',
            relevanceScore: c.score || 0.95
          }
        ])
      ).values()
    );

    // 4. Build message payload with populated system prompt
    const populatedSystemPrompt = buildChatSystemPrompt(review);
    const userPrompt = buildChatUserMessage(content, contextEntries);

    const messagesPayload = cleanHistory.map(m => ({
      role: m.role === 'system' ? 'assistant' : m.role,
      content: m.content
    }));
    
    // Replace the last message content with the enriched RAG prompt
    if (messagesPayload.length > 0) {
      messagesPayload[messagesPayload.length - 1].content = userPrompt;
    }

    let fullResponse = '';

    // 5. Stream response from chat model using populated system prompt
    try {
      const stream = chatService.chatResponse(messagesPayload, populatedSystemPrompt, 2048);
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        yield chunk; // Stream to client
      }

      const elapsed = Date.now() - startTime;

      let safeResponse = fullResponse;
      try {
        safeResponse = guardrailService.validateAssistantResponse(fullResponse);
      } catch {
        safeResponse = 'I can only answer using the provided review and document context.';
      }

      // 6. Save assistant message after stream finishes
      await ChatMessage.create({
        sessionId,
        role: 'assistant',
        content: safeResponse,
        messageType: 'text',
        modelUsed: env.chatModel,
        citations: [...new Set(citations)],
        metadata: {
          processingTime: elapsed,
          sources: formattedSources,
        }
      });

      // Update session timestamp
      await ChatSession.findByIdAndUpdate(sessionId, {
        lastMessageAt: new Date(),
        $inc: { messageCount: 2 } // 1 user + 1 assistant
      });

      logger.info('Chat response complete', { sessionId, elapsed: `${elapsed}ms` });

    } catch (error) {
      logger.error('Chat processing failed', { error: error.message });
      yield `\n\n**Error:** An issue occurred while generating the response: ${error.message}`;
    }
  }
}

export default new ChatEngine();
