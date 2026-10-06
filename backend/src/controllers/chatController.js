import ChatSession from '../models/ChatSession.js';
import ChatMessage from '../models/ChatMessage.js';
import Review from '../models/Review.js';
import Project from '../models/Project.js';
import chatService from '../services/ai/chatService.js';
import vectorSearchService from '../services/vectorSearchService.js';
import guardrailService from '../services/guardrailService.js';
import { buildChatSystemPrompt } from '../prompts/chatPrompt.js';
import env from '../config/env.js';

import chatEngine from '../services/chatEngine.js';

export const createSession = async (req, res, next) => {
  try {
    const { projectId, title } = req.body;
    const project = await Project.findOne({ _id: projectId, userId: req.user._id }).lean();
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

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

    // Process through unified ChatEngine (handles RAG, context fallback, history sanitization, and sources)
    const stream = chatEngine.processMessage(sessionId, req.user._id, content);
    for await (const chunk of stream) {
      // Consume generator
    }

    const assistantMessage = await ChatMessage.findOne({ sessionId, role: 'assistant' })
      .sort({ createdAt: -1 })
      .lean();

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
