import { Router } from 'express';
import passport from 'passport';
import { register, verifyOTP, login, getMe, refreshToken, forgotPassword, resetPassword, googleCallback } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { validate } from '../middleware/errorHandler.js';
import { registerValidation, verifyOtpValidation, loginValidation, forgotPasswordValidation, resetPasswordValidation } from '../utils/validators.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Rate limit all auth routes
// router.use(authLimiter);

// Local auth
router.post('/register', registerValidation, validate, register);
router.post('/verify-otp', verifyOtpValidation, validate, verifyOTP);
router.post('/login', loginValidation, validate, login);
router.post('/forgot-password', forgotPasswordValidation, validate, forgotPassword);
router.post('/reset-password', resetPasswordValidation, validate, resetPassword);
router.post('/refresh', refreshToken);

// Protected
router.get('/me', authMiddleware, getMe);

// Google OAuth - Paused
// router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
// router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: '/login' }), googleCallback);

export default router;
