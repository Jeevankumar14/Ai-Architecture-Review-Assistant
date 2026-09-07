import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env variables
dotenv.config({ path: 'c:/Jeevans files/Ai-Architecture-review-working/Ai-Architecture-Review-Assistant/backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI;

// Define simple schemas inline
const DocumentSchema = new mongoose.Schema({}, { strict: false, collection: 'documents' });
const ReviewSchema = new mongoose.Schema({}, { strict: false, collection: 'reviews' });

async function run() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected!');

    const Document = mongoose.model('Document', DocumentSchema);
    const Review = mongoose.model('Review', ReviewSchema);

    const docs = await Document.find({}).sort({ createdAt: -1 }).limit(5);
    console.log('\n--- Latest 5 Documents ---');
    docs.forEach(d => {
      console.log({
        _id: d._id,
        fileName: d.get('fileName'),
        status: d.get('status'),
        processingError: d.get('processingError'),
        createdAt: d.get('createdAt')
      });
    });

    const reviews = await Review.find({}).sort({ createdAt: -1 }).limit(5);
    console.log('\n--- Latest 5 Reviews ---');
    reviews.forEach(r => {
      console.log({
        _id: r._id,
        projectId: r.get('projectId'),
        status: r.get('status'),
        error: r.get('error'),
        generatedAt: r.get('generatedAt'),
        executiveSummarySnippet: r.get('executiveSummary')?.substring(0, 100)
      });
    });

  } catch (error) {
    console.error('Error running check-db:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

run();
