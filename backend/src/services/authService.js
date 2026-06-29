import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import env from '../config/env.js';
import nodemailer from 'nodemailer';

class AuthService {
  /**
   * Generate JWT access token
   */
  generateAccessToken(userId, rememberMe = false) {
    const expiresIn = rememberMe ? env.jwtRememberMeExpiresIn : env.jwtExpiresIn;
    return jwt.sign({ id: userId }, env.jwtSecret, { expiresIn });
  }

  /**
   * Generate JWT refresh token
   */
  generateRefreshToken(userId) {
    return jwt.sign({ id: userId, type: 'refresh' }, env.jwtSecret, {
      expiresIn: env.jwtRefreshExpiresIn,
    });
  }

  /**
   * Register a new user with email/password
   */
  async register({ name, email, password }) {
    let user = await User.findOne({ email }).select('+password');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes

    if (user) {
      if (user.isEmailVerified) {
        const error = new Error('Email already registered');
        error.statusCode = 409;
        throw error;
      }
      // Re-registration for unverified user
      user.name = name;
      user.password = password; // pre-save hook will hash it
      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();
    } else {
      user = await User.create({
        name,
        email,
        password,
        authProvider: 'local',
        otp,
        otpExpires,
      });
    }

    try {
      const transporter = nodemailer.createTransport({
        host: env.smtpHost,
        port: env.smtpPort,
        secure: false,
        auth: { user: env.smtpUser, pass: env.smtpPass },
      });

      await transporter.sendMail({
        from: `"Architecture Review" <${env.emailFrom}>`,
        to: email,
        subject: 'Verify Your Account - Architecture Review Assistant',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a56db;">Verify Your Email</h2>
            <p>Hi ${name},</p>
            <p>Your verification code is: <strong style="font-size: 24px;">${otp}</strong></p>
            <p style="color: #666; font-size: 14px;">This code expires in 5 minutes.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
          </div>
        `,
      });
    } catch (err) {
      console.error('OTP email send failed:', err);
    }
    
    // Log for local development
    console.log(`\n[DEV MODE] 🔐 OTP generated for ${email}: ${otp}\n`);

    return {
      message: 'OTP sent to your email. Please verify to continue.',
      email: user.email
    };
  }

  /**
   * Verify OTP to activate account
   */
  async verifyOTP(email, otp) {
    const user = await User.findOne({ email }).select('+otp +otpExpires');
    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }
    
    if (user.isEmailVerified) {
      const error = new Error('Email is already verified');
      error.statusCode = 400;
      throw error;
    }

    if (!user.otp || user.otp !== otp || user.otpExpires < Date.now()) {
      const error = new Error('Invalid or expired OTP');
      error.statusCode = 400;
      throw error;
    }

    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return { message: 'Email verified successfully. You can now login.' };
  }

  /**
   * Login with email/password
   */
  async login({ email, password, rememberMe = false }) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    if (user.authProvider === 'google' && !user.password) {
      const error = new Error('This account uses Google sign-in. Please sign in with Google.');
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.statusCode = 401;
      throw error;
    }

    const accessToken = this.generateAccessToken(user._id, rememberMe);
    const refreshToken = this.generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    return {
      user: user.toSafeObject(),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Handle Google OAuth callback - generate tokens for the authenticated user
   */
  async handleGoogleAuth(user) {
    const accessToken = this.generateAccessToken(user._id);
    const refreshToken = this.generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    return { user: user.toSafeObject(), accessToken, refreshToken };
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken) {
    const decoded = jwt.verify(refreshToken, env.jwtSecret);
    if (decoded.type !== 'refresh') {
      const error = new Error('Invalid refresh token');
      error.statusCode = 401;
      throw error;
    }

    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      const error = new Error('Invalid refresh token');
      error.statusCode = 401;
      throw error;
    }

    const newAccessToken = this.generateAccessToken(user._id);
    const newRefreshToken = this.generateRefreshToken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }

  /**
   * Send password reset OTP email
   */
  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal whether email exists
      return { message: 'If an account exists, a reset OTP has been sent.' };
    }

    if (user.authProvider === 'google') {
      return { message: 'This account uses Google sign-in. Password reset is not applicable.' };
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    try {
      const transporter = nodemailer.createTransport({
        host: env.smtpHost,
        port: env.smtpPort,
        secure: false,
        auth: { user: env.smtpUser, pass: env.smtpPass },
      });

      await transporter.sendMail({
        from: `"Architecture Review" <${env.emailFrom}>`,
        to: user.email,
        subject: 'Password Reset OTP - Architecture Review Assistant',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1a56db;">Reset Your Password</h2>
            <p>Hi ${user.name},</p>
            <p>You requested a password reset. Your OTP code is:</p>
            <h1 style="letter-spacing: 4px; color: #1a56db; font-size: 32px;">${otp}</h1>
            <p style="color: #666; font-size: 14px;">This code expires in 10 minutes.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this, please ignore this email.</p>
          </div>
        `,
      });
    } catch (err) {
      user.otp = undefined;
      user.otpExpires = undefined;
      await user.save({ validateBeforeSave: false });
      console.error('Email send failed:', err);
    }
    
    console.log(`\n[DEV MODE] 🔐 Password Reset OTP for ${email}: ${otp}\n`);

    return { message: 'If an account exists, a reset OTP has been sent.' };
  }

  /**
   * Reset password using OTP
   */
  async resetPassword(email, otp, newPassword) {
    const user = await User.findOne({ email }).select('+otp +otpExpires');

    if (!user) {
      const error = new Error('Invalid email or OTP');
      error.statusCode = 400;
      throw error;
    }

    if (!user.otp || user.otp !== otp || user.otpExpires < Date.now()) {
      const error = new Error('Invalid or expired OTP');
      error.statusCode = 400;
      throw error;
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.refreshToken = undefined; // Invalidate sessions
    await user.save();

    return { message: 'Password reset successful. Please log in with your new password.' };
  }
}

export default new AuthService();
