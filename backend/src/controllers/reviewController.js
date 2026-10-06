import Review from '../models/Review.js';
import reviewEngine from '../services/reviewEngine.js';
import Project from '../models/Project.js';
import Document from '../models/Document.js';

export const generateReview = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findOne({ _id: projectId, userId: req.user._id });
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found' });
    }

    const docs = await Document.find({ projectId, userId: req.user._id });
    const documentIds = docs.map((d) => d._id);

    const result = await reviewEngine.generateReview(projectId, req.user._id, documentIds);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const listReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ projectId: req.params.projectId, userId: req.user._id })
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
    const review = await Review.findOne({ projectId: req.params.projectId, userId: req.user._id })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: { review: review || null } });
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const result = await reviewEngine.deleteReview(req.params.id, req.user._id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

