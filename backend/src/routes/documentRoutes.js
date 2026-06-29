import { Router } from 'express';
import { uploadDocuments as uploadHandler, listDocuments, getDocument, getProcessingStatus } from '../controllers/documentController.js';
import { uploadDocuments as uploadMiddleware } from '../middleware/uploadMiddleware.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validate } from '../middleware/errorHandler.js';
import { projectIdParam, mongoIdParam } from '../utils/validators.js';
import { uploadLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(authMiddleware);

router.post('/:projectId/documents', uploadLimiter, projectIdParam, validate, uploadMiddleware, uploadHandler);
router.get('/:projectId/documents', projectIdParam, validate, listDocuments);
router.get('/:projectId/documents/status', projectIdParam, validate, getProcessingStatus);
router.get('/documents/:id', mongoIdParam, validate, getDocument);

export default router;
