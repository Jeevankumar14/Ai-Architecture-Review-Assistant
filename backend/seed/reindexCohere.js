/**
 * reindexCohere.js
 * 
 * Production Migration & Re-indexing utility.
 * Re-embeds all Knowledge Base seed files using Cohere Cloud embed-v4.0 (output_dimension: 1024)
 * and stores them in MongoDB Atlas Vector Index collection.
 * 
 * Usage:
 *   node seed/reindexCohere.js
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import embeddingService from '../src/services/embeddingService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_DIR = path.resolve(__dirname, './');
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in your .env file.');
  process.exit(1);
}

const DUMMY_ID = '000000000000000000000000';

const documentChunkSchema = new mongoose.Schema(
  {
    documentId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    projectId:  { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    type:       { type: String, enum: ['document', 'knowledge'], default: 'document' },
    category:   { type: String },
    chunkIndex: { type: Number, required: true },
    content:    { type: String, required: true },
    tokenCount: { type: Number, default: 0 },
    embedding:  { type: [Number], required: true },
    metadata:   { source: String, section: String, page: Number, documentType: String, title: String, subcategory: String },
  },
  { timestamps: true }
);

const DocumentChunk = mongoose.models.DocumentChunk ||
  mongoose.model('DocumentChunk', documentChunkSchema, 'archcollection');

function formatTime(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function buildTextForEmbedding(entry) {
  return [
    `Title: ${entry.title}`,
    `Category: ${entry.category}`,
    `Description: ${entry.description}`,
    `Best Practices: ${(entry.best_practices || entry.bestPractices || []).join(', ')}`,
    `Anti-Patterns: ${(entry.anti_patterns || entry.antiPatterns || []).join(', ')}`,
  ].join('. ');
}

async function main() {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║   ⚡ Cohere Cloud 1024-dim KB Re-indexer            ║');
  console.log('║   Model: embed-v4.0 | Output Dimension: 1024         ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  console.log('📡 Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB\n');

  const seedFiles = fs.readdirSync(SEED_DIR).filter(f => f.endsWith('.json') && !f.includes('package'));
  console.log(`📂 Found ${seedFiles.length} seed files\n`);

  let totalNew = 0;
  let totalUpdated = 0;
  let totalFailed = 0;
  const overallStart = Date.now();

  for (const file of seedFiles) {
    const filePath = path.join(SEED_DIR, file);
    let entries = [];
    try {
      const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      entries = Array.isArray(raw) ? raw : (raw.entries || []);
    } catch (err) {
      console.error(`  ❌ Failed to parse ${file}: ${err.message}`);
      continue;
    }

    console.log(`  📄 Processing ${file} (${entries.length} entries)...`);

    // Process in batches of 48 for high throughput and rate-limit safety
    const BATCH_SIZE = 48;
    for (let i = 0; i < entries.length; i += BATCH_SIZE) {
      const batchEntries = entries.slice(i, i + BATCH_SIZE);
      const texts = batchEntries.map(buildTextForEmbedding);

      try {
        const embeddings = await embeddingService.generateBatchEmbeddings(texts, 'search_document');

        for (let j = 0; j < batchEntries.length; j++) {
          const entry = batchEntries[j];
          const text = texts[j];
          const embedding = embeddings[j];

          if (!embedding || embedding.length !== 1024) {
            throw new Error(`Invalid embedding dimension: ${embedding?.length} (expected 1024)`);
          }

          const res = await DocumentChunk.findOneAndUpdate(
            {
              type: 'knowledge',
              'metadata.title': entry.title,
            },
            {
              $set: {
                projectId: DUMMY_ID,
                documentId: DUMMY_ID,
                type: 'knowledge',
                category: entry.category,
                chunkIndex: i + j,
                content: text,
                embedding,
                tokenCount: Math.ceil(text.length / 4),
                metadata: {
                  title: entry.title,
                  subcategory: entry.subcategory || '',
                  source: entry.source || file.replace('.json', ''),
                },
              },
            },
            { upsert: true, new: true, rawResult: true }
          );

          if (res.lastErrorObject?.updatedExisting) {
            totalUpdated++;
          } else {
            totalNew++;
          }
        }

        process.stdout.write(`\r      ↳ Batched ${Math.min(i + BATCH_SIZE, entries.length)}/${entries.length} entries`);
      } catch (err) {
        totalFailed += batchEntries.length;
        console.error(`\n      ⚠️ Batch error in ${file}: ${err.message}`);
      }
    }
    console.log(`\n      ✅ Completed ${file}\n`);
  }

  const elapsed = formatTime(Date.now() - overallStart);
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║   ✨ Cohere KB Re-indexing Complete!                 ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log(`║   📥 New chunks created    : ${String(totalNew).padEnd(23)} ║`);
  console.log(`║   🔄 Existing chunks updated: ${String(totalUpdated).padEnd(23)} ║`);
  console.log(`║   ❌ Failed                 : ${String(totalFailed).padEnd(23)} ║`);
  console.log(`║   ⏱️  Total time            : ${String(elapsed).padEnd(23)} ║`);
  console.log('╚══════════════════════════════════════════════════════╝\n');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error('\n❌ Fatal error during reindexing:', err.message);
  mongoose.disconnect();
  process.exit(1);
});
