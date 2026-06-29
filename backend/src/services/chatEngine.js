import chatService from './ai/chatService.js';
import env from '../config/env.js';
import vectorSearchService from './vectorSearchService.js';
import ChatSession from '../models/ChatSession.js';
import ChatMessage from '../models/ChatMessage.js';
import Project from '../models/Project.js';
import logger from '../utils/logger.js';
import { chatSystemPrompt, buildChatUserMessage } from '../prompts/chatPrompt.js';

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

    // 2. Retrieve conversation history (last 10 messages)
    const history = await ChatMessage.find({ sessionId })
      .sort({ createdAt: 1 })
      .limit(10)
      .lean();

    // 3. RAG Retrieval via Vector Search (combines knowledge base and documents)
    const contextEntries = await vectorSearchService.searchKnowledgeBase(content, session.projectId, 10);
    const citations = contextEntries.map(entry => entry.metadata?.source || entry.category || 'Architecture Document');

    // 4. Build message payload for chat model
    const userPrompt = buildChatUserMessage(content, contextEntries);
    const messagesPayload = history.map(m => ({
      role: m.role === 'system' ? 'assistant' : m.role, // Anthropic expects user/assistant
      content: m.content
    }));
    
    // Replace the last message content with the enriched RAG prompt
    messagesPayload[messagesPayload.length - 1].content = userPrompt;

    let fullResponse = '';

    // 5. Stream response from chat model
    try {
      const stream = chatService.chatResponse(messagesPayload, chatSystemPrompt, 2048);
      
      for await (const chunk of stream) {
        fullResponse += chunk;
        yield chunk; // Stream to client
      }

      const elapsed = Date.now() - startTime;

      // 6. Save assistant message after stream finishes
      await ChatMessage.create({
        sessionId,
        role: 'assistant',
        content: fullResponse,
        messageType: 'text',
        modelUsed: env.chatModel,
        citations: [...new Set(citations)],
        metadata: {
          processingTime: elapsed,
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
