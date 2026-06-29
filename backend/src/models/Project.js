import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'deleted'],
      default: 'active',
    },
    documentCount: {
      type: Number,
      default: 0,
    },
    lastReviewAt: Date,
    tags: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: documents
projectSchema.virtual('documents', {
  ref: 'Document',
  localField: '_id',
  foreignField: 'projectId',
});

// Virtual: reviews
projectSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'projectId',
});

// Virtual: chat sessions
projectSchema.virtual('chatSessions', {
  ref: 'ChatSession',
  localField: '_id',
  foreignField: 'projectId',
});

// Compound index for user queries
projectSchema.index({ userId: 1, status: 1, updatedAt: -1 });

const Project = mongoose.model('Project', projectSchema);
export default Project;
