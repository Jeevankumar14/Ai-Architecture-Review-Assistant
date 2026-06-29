import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
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
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
      enum: ['pdf', 'docx', 'txt', 'json', 'yaml', 'yml', 'md', 'png', 'jpg', 'jpeg', 'webp'],
    },
    mimeType: String,
    fileSize: {
      type: Number,
      required: true,
    },
    s3Key: {
      type: String,
      required: true,
    },
    s3Url: String,
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'processed', 'failed'],
      default: 'uploaded',
    },
    extractedText: {
      type: String,
      select: false, // Large field, only load when needed
    },
    architectureData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    textLength: Number,
    chunkCount: {
      type: Number,
      default: 0,
    },
    processingError: String,
    metadata: {
      pages: Number,
      sections: [String],
      documentType: {
        type: String,
        enum: ['srs', 'architecture', 'hld', 'lld', 'api-spec', 'openapi', 'database-schema', 'deployment', 'technical-design', 'guidelines', 'diagram', 'other'],
        default: 'other',
      },
    },
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ projectId: 1, status: 1 });
documentSchema.index({ userId: 1, createdAt: -1 });

const Document = mongoose.model('Document', documentSchema);
export default Document;
