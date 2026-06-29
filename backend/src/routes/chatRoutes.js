import { Router } from 'express';
import { createSession, listSessions, getSession, sendMessage, deleteSession } from '../controllers/chatController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validate } from '../middleware/errorHandler.js';
import { mongoIdParam, chatMessageValidation } from '../utils/validators.js';
import { aiChatLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(authMiddleware);

router.post('/sessions', createSession);
router.get('/sessions', listSessions);
router.get('/sessions/:id', mongoIdParam, validate, getSession);
router.post('/sessions/:id/messages', mongoIdParam, chatMessageValidation, validate, aiChatLimiter, sendMessage);
router.delete('/sessions/:id', mongoIdParam, validate, deleteSession);

export default router;
