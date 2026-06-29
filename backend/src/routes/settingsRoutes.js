import { Router } from 'express';
import Setting from '../models/Setting.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();
router.use(authMiddleware);

// Get user settings
router.get('/', async (req, res, next) => {
  try {
    let settings = await Setting.findOne({ userId: req.user._id });
    if (!settings) {
      settings = await Setting.create({ userId: req.user._id });
    }
    res.status(200).json({ success: true, data: { settings } });
  } catch (error) {
    next(error);
  }
});

// Update user settings
router.put('/', async (req, res, next) => {
  try {
    const allowedFields = ['reviewDepth', 'scoringMode', 'notifications', 'maxTokensPerRequest'];
    const updates = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const settings = await Setting.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updates },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(200).json({ success: true, data: { settings } });
  } catch (error) {
    next(error);
  }
});

export default router;
