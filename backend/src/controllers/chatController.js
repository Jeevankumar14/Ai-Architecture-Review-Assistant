import ChatSession from '../models/ChatSession.js';
import ChatMessage from '../models/ChatMessage.js';
import Review from '../models/Review.js';
import chatService from '../services/ai/chatService.js';
import vectorSearchService from '../services/vectorSearchService.js';
import { buildChatSystemPrompt } from '../prompts/chatPrompt.js';
import env from '../config/env.js';

export const createSession = async (req, res, next) => {
  try {
    const { projectId, title } = req.body;
    const session = await ChatSession.create({
      projectId,
      userId: req.user._id,
      title: title || 'New Architecture Analysis',
    });
    res.status(201).json({ success: true, data: { session } });
  } catch (error) {
    next(error);
  }
};

export const listSessions = async (req, res, next) => {
  try {
    const sessions = await ChatSession.find({ userId: req.user._id, status: 'active' })
      .sort({ updatedAt: -1 })
      .populate('projectId', 'name')
      .lean();
    res.status(200).json({ success: true, data: { sessions } });
  } catch (error) {
    next(error);
  }
};

export const getSession = async (req, res, next) => {
  try {
    const session = await ChatSession.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('projectId', 'name description');

    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    const messages = await ChatMessage.find({ sessionId: session._id })
      .sort({ createdAt: 1 })
      .lean();

    res.status(200).json({ success: true, data: { session, messages } });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    const sessionId = req.params.id;

    const session = await ChatSession.findOne({ _id: sessionId, userId: req.user._id });
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    // Save user message
    await ChatMessage.create({
      sessionId,
      role: 'user',
      content,
    });

    // Get conversation history
    const history = await ChatMessage.find({ sessionId })
      .sort({ createdAt: 1 })
      .limit(20)
      .lean();

    const conversationHistory = history.map((m) => ({
      role: m.role === 'system' ? 'user' : m.role,
      content: m.content.slice(0, 2000), // Limit context size
    }));

    // Get review context
    const review = session.reviewId
      ? await Review.findById(session.reviewId).lean()
      : await Review.findOne({ projectId: session.projectId }).sort({ generatedAt: -1 }).lean();

    // Get relevant document chunks and KB entries for this query
    const searchResults = await vectorSearchService.searchAll(content, session.projectId, {
      docLimit: 6,
      kbLimit: 4,
    });

    // Build system prompt with context
    const systemPrompt = buildChatSystemPrompt(
      review,
      searchResults.documentChunks,
      searchResults.knowledgeBase
    );

    // Get AI response (non-streaming for simplicity)
    const startTime = Date.now();
    let responseContent = '';
    const stream = chatService.chatResponse(conversationHistory, systemPrompt, 300);
    for await (const chunk of stream) {
      responseContent += chunk;
    }

    const elapsed = Date.now() - startTime;

    // Save assistant message
    const assistantMessage = await ChatMessage.create({
      sessionId,
      role: 'assistant',
      content: responseContent,
      metadata: {
        model: env.chatModel,
        sources: Array.from(
          new Map(
            searchResults.documentChunks.slice(0, 5).map((c) => [
              c.metadata?.source || 'Unknown',
              { documentName: c.metadata?.source || 'Unknown', relevanceScore: c.score }
            ])
          ).values()
        ),
        processingTime: elapsed,
      },
    });

    // Update session
    await ChatSession.findByIdAndUpdate(sessionId, {
      $inc: { messageCount: 2 },
      lastMessageAt: new Date(),
    });

    res.status(200).json({
      success: true,
      data: { message: assistantMessage },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSession = async (req, res, next) => {
  try {
    const session = await ChatSession.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }
    await ChatMessage.deleteMany({ sessionId: session._id });
    res.status(200).json({ success: true, data: { message: 'Session deleted' } });
  } catch (error) {
    next(error);
  }
};
