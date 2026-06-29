import Review from '../models/Review.js';
import reviewEngine from '../services/reviewEngine.js';

export const generateReview = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const result = await reviewEngine.generateReview(projectId, req.user._id);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const listReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ projectId: req.params.projectId })
      .sort({ generatedAt: -1 })
      .select('-keyFindings')
      .lean();
    res.status(200).json({ success: true, data: { reviews } });
  } catch (error) {
    next(error);
  }
};

export const getReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({ _id: req.params.id, userId: req.user._id });
    if (!review) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }
    res.status(200).json({ success: true, data: { review } });
  } catch (error) {
    next(error);
  }
};

export const getLatestReview = async (req, res, next) => {
  try {
    const review = await Review.findOne({ projectId: req.params.projectId })
      .sort({ generatedAt: -1 });
    if (!review) {
      return res.status(404).json({ success: false, error: 'No reviews found for this project' });
    }
    res.status(200).json({ success: true, data: { review } });
  } catch (error) {
    next(error);
  }
};
