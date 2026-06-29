import { Router } from 'express';
import { generateReview, listReviews, getReview, getLatestReview } from '../controllers/reviewController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validate } from '../middleware/errorHandler.js';
import { projectIdParam, mongoIdParam } from '../utils/validators.js';
import { aiReviewLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.use(authMiddleware);

router.post('/:projectId/reviews/generate', aiReviewLimiter, projectIdParam, validate, generateReview);
router.get('/:projectId/reviews', projectIdParam, validate, listReviews);
router.get('/:projectId/reviews/latest', projectIdParam, validate, getLatestReview);
router.get('/reviews/:id', mongoIdParam, validate, getReview);

export default router;
