import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review',
    },
    title: {
      type: String,
      default: 'New Architecture Review',
      trim: true,
      maxlength: 200,
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
    messageCount: {
      type: Number,
      default: 0,
    },
    lastMessageAt: Date,
  },
  {
    timestamps: true,
  }
);

chatSessionSchema.index({ userId: 1, updatedAt: -1 });
chatSessionSchema.index({ projectId: 1, updatedAt: -1 });

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
export default ChatSession;
