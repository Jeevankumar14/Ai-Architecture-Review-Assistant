import { Router } from 'express';
import DocumentChunk from '../models/DocumentChunk.js';
import authMiddleware from '../middleware/authMiddleware.js';
import embeddingService from '../services/embeddingService.js';
import logger from '../utils/logger.js';

const router = Router();

router.use(authMiddleware);

// List KB categories
router.get('/categories', async (req, res, next) => {
  try {
    const categories = await DocumentChunk.aggregate([
      { $match: { type: 'knowledge' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    res.status(200).json({
      success: true,
      data: { categories: categories.map((c) => ({ name: c._id, count: c.count })) },
    });
  } catch (error) {
    next(error);
  }
});

// Seed KB endpoint (admin)
router.post('/seed', async (req, res, next) => {
  try {
    const { default: fs } = await import('fs');
    const { default: path } = await import('path');
    const { fileURLToPath } = await import('url');

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const seedDir = path.resolve(__dirname, '../../seed');

    const seedFiles = fs.readdirSync(seedDir).filter((f) => f.endsWith('.json'));
    let totalSeeded = 0;

    // Get a "dummy" project ID to satisfy Mongoose validation if it requires one. 
    // Wait, projectId is required in DocumentChunk schema. We can fetch an Admin project or user must supply one.
    // However, for KB, we could alter the schema to make projectId NOT required if type === 'knowledge'.
    // Or we just insert a dummy ID/leave it. Let's make sure our schema handles it or we assign a 000 ID.
    const dummyProjectId = '000000000000000000000000';
    const dummyDocumentId = '000000000000000000000000';

    for (const file of seedFiles) {
      const filePath = path.join(seedDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      const entries = Array.isArray(data) ? data : data.entries || [];

      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        
        // Construct a rich text chunk from the KB entry
        const textForEmbedding = [
          `Title: ${entry.title}`,
          `Category: ${entry.category}`,
          `Description: ${entry.description}`,
          `Best Practices: ${(entry.best_practices || entry.bestPractices || []).join(', ')}`,
          `Anti-Patterns: ${(entry.anti_patterns || entry.antiPatterns || []).join(', ')}`,
        ].join('. ');

        // Check if we already seeded it
        const existing = await DocumentChunk.findOne({ 
          type: 'knowledge', 
          'metadata.title': entry.title 
        });
        
        if (existing) continue;

        let embedding = [];
        try {
          embedding = await embeddingService.embedQuery(textForEmbedding);
        } catch (err) {
          logger.warn('Embedding generation failed for KB entry', { title: entry.title, error: err.message });
          continue; // Skip if embedding fails
        }

        await DocumentChunk.create({
          projectId: dummyProjectId,
          documentId: dummyDocumentId,
          type: 'knowledge',
          category: entry.category,
          chunkIndex: i,
          content: textForEmbedding,
          embedding,
          tokenCount: Math.ceil(textForEmbedding.length / 4), // rough estimate
          metadata: {
            title: entry.title,
            subcategory: entry.subcategory || '',
            source: entry.source || file.replace('.json', ''),
          }
        });

        totalSeeded++;
      }
    }

    res.status(200).json({
      success: true,
      data: { message: `Seeded ${totalSeeded} knowledge base chunks`, total: totalSeeded },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
