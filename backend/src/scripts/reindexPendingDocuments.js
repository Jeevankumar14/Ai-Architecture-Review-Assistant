import 'dotenv/config';
import connectDatabase from '../config/database.js';
import Document from '../models/Document.js';
import DocumentChunk from '../models/DocumentChunk.js';
import chunkingService from '../services/chunkingService.js';
import embeddingService from '../services/embeddingService.js';
import logger from '../utils/logger.js';

async function reindexPendingDocuments() {
  console.log('=== Starting Document Indexing & Healing Script ===');
  await connectDatabase();

  // Find all documents that need chunking and embeddings
  const documents = await Document.find({
    status: 'processed',
    $or: [
      { ragReady: false },
      { chunkCount: { $lte: 0 } },
      { chunkCount: { $exists: false } },
    ],
  }).select('+extractedText originalName projectId status ragReady chunkCount');

  console.log(`Found ${documents.length} document(s) needing chunking and embeddings.`);

  for (const doc of documents) {
    console.log(`\nProcessing: ${doc.originalName} (ID: ${doc._id})`);

    const existingChunkCount = await DocumentChunk.countDocuments({ documentId: doc._id });
    if (existingChunkCount > 0) {
      console.log(`- Document already has ${existingChunkCount} chunks in DB. Updating flags...`);
      await Document.findByIdAndUpdate(doc._id, {
        ragReady: true,
        chunkCount: existingChunkCount,
      });
      continue;
    }

    const text = doc.extractedText;
    if (!text || !text.trim()) {
      console.warn(`- Document ${doc.originalName} has no extracted text! Skipping.`);
      continue;
    }

    console.log(`- Chunking document text (${text.length} chars)...`);
    const chunks = chunkingService.chunkDocument(text, {
      source: doc.originalName || 'Architecture Document',
      documentType: 'architecture',
    });

    console.log(`- Generated ${chunks.length} chunks. Creating Cohere embed-v4.0 vectors...`);
    const stored = await embeddingService.embedAndStoreChunks(chunks, doc._id, doc.projectId);

    await Document.findByIdAndUpdate(doc._id, {
      ragReady: true,
      chunkCount: chunks.length,
    });

    console.log(`✅ ${doc.originalName} successfully indexed! (${stored.length} chunks stored in DB)`);
  }

  console.log('\n=== All pending documents processed successfully ===');
  process.exit(0);
}

reindexPendingDocuments().catch((err) => {
  console.error('Fatal error in reindexPendingDocuments:', err);
  process.exit(1);
});
