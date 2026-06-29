import { validationResult } from 'express-validator';

/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, _next) => {
  console.error('❌ Error:', err.message);
  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, error: 'Validation Error', details: messages });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({ success: false, error: `Duplicate value for: ${field}` });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, error: 'Token expired' });
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, error: 'File size exceeds 25MB limit' });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ success: false, error: 'Unexpected file field' });
  }

  const status = err.statusCode || err.status || 500;
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Never expose internal error details (like DB errors or API keys) in production
  let errorMessage = err.message || 'Internal Server Error';
  if (isProduction && status >= 500) {
    errorMessage = 'An internal server error occurred. Please try again later.';
  }

  res.status(status).json({
    success: false,
    error: errorMessage,
    ...(!isProduction && { stack: err.stack }),
  });
};

/**
 * Validation result checker middleware
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

/**
 * 404 handler
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.originalUrl}` });
};
