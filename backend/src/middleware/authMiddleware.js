import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import env from '../config/env.js';

const authMiddleware = async (req, res, next) => {
  try {
    let token;

    // Check Authorization header
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, error: 'Not authenticated. Please log in.' });
    }

    // Verify token
    const decoded = jwt.verify(token, env.jwtSecret);

    // Check if user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, error: 'User no longer exists.' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, error: 'Invalid token.' });
  }
};

export default authMiddleware;
