import { body, param, query } from 'express-validator';

export const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
];

export const loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const forgotPasswordValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
];

export const verifyOtpValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits')
    .isNumeric().withMessage('OTP must contain only numbers')
    .escape(),
];

export const resetPasswordValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('otp')
    .trim()
    .notEmpty().withMessage('OTP is required')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be exactly 6 digits')
    .isNumeric().withMessage('OTP must contain only numbers')
    .escape(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
];

export const projectValidation = [
  body('name').trim().notEmpty().withMessage('Project name is required').isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 2000 }),
];

export const mongoIdParam = [
  param('id').isMongoId().withMessage('Invalid ID format'),
];

export const projectIdParam = [
  param('projectId').isMongoId().withMessage('Invalid project ID format'),
];

export const chatMessageValidation = [
  body('content').trim().notEmpty().withMessage('Message content is required').isLength({ max: 10000 }),
];

export const paginationQuery = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];
