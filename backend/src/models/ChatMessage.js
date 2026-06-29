import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatSession',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    messageType: {
      type: String,
      enum: ['text', 'review', 'scorecard', 'error'],
      default: 'text',
    },
    modelUsed: {
      type: String,
      default: 'meta-llama/llama-3.3-70b-instruct:free',
    },
    citations: [String],
    metadata: {
      tokensUsed: Number,
      model: String,
      sources: [
        {
          documentName: String,
          chunkIndex: Number,
          relevanceScore: Number,
        },
      ],
      processingTime: Number,
    },
  },
  {
    timestamps: true,
  }
);

chatMessageSchema.index({ sessionId: 1, createdAt: 1 });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
export default ChatMessage;
