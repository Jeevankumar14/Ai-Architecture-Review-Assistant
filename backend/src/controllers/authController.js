import authService from '../services/authService.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const result = await authService.register({ name, email, password });
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const result = await authService.verifyOTP(email, otp);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;
    const result = await authService.login({ email, password, rememberMe });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res) => {
  res.status(200).json({ success: true, data: { user: req.user.toSafeObject() } });
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ success: false, error: 'Refresh token is required' });
    }
    const result = await authService.refreshAccessToken(refreshToken);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body.email);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, password } = req.body;
    const result = await authService.resetPassword(email, otp, password);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const googleCallback = async (req, res, next) => {
  try {
    const result = await authService.handleGoogleAuth(req.user);
    // Redirect to frontend with tokens
    const params = new URLSearchParams({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/callback?${params}`);
  } catch (error) {
    next(error);
  }
};
