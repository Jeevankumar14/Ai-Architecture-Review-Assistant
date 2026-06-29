import rateLimit from 'express-rate-limit';

/** General API rate limiter: 100 requests per 15 minutes */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please try again later.' },
});

/** Auth rate limiter: 20 attempts per 15 minutes */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many auth attempts. Please try again later.' },
});

/** AI Review Generation limiter: 5 requests per hour (per user) to prevent huge LLM costs */
export const aiReviewLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { success: false, error: 'AI review generation limit reached (5 per hour). Please wait before requesting another comprehensive review.' },
});

/** AI Chat limiter: 30 requests per 15 minutes (per user) */
export const aiChatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { success: false, error: 'AI chat rate limit reached. Please wait a few minutes before sending more messages.' },
});

/** Upload rate limiter: 20 uploads per hour */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { success: false, error: 'Upload limit reached. Please try again later.' },
});
