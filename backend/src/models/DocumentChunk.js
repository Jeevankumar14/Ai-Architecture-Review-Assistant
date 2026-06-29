import mongoose from 'mongoose';

const documentChunkSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["document", "knowledge"],
      default: "document",
    },
    category: {
      type: String,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    tokenCount: {
      type: Number,
      default: 0,
    },
    embedding: {
      type: [Number],
      required: true,
    },
    metadata: {
      source: String,
      section: String,
      page: Number,
      documentType: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for project-based queries
documentChunkSchema.index({ projectId: 1, chunkIndex: 1 });
documentChunkSchema.index({ documentId: 1, chunkIndex: 1 });

// NOTE: MongoDB Atlas Vector Search index must be created via Atlas UI or CLI:
// Index name: "vector_index"
// {
//   "fields": [{
//     "type": "vector",
//     "path": "embedding",
//     "numDimensions": 1024,
//     "similarity": "cosine"
//   }, {
//     "type": "filter",
//     "path": "projectId"
//   }]
// }

const DocumentChunk = mongoose.model('DocumentChunk', documentChunkSchema, 'archcollection');
export default DocumentChunk;
