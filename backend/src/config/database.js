import mongoose from 'mongoose';
import env from './env.js';

const connectWithUri = async (uri) => mongoose.connect(uri, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
});

const connectDatabase = async (maxRetries = 5, retryDelayMs = 3000) => {
  let attempts = 0;

  while (attempts < maxRetries) {
    try {
      attempts++;
      const conn = await connectWithUri(env.mongoUri);

      console.log(`✅ MongoDB connected: ${conn.connection.host}`);

      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err.message);
      });

      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected. Attempting reconnect...');
      });

      return conn;
    } catch (error) {
      console.warn(`⚠️  MongoDB connection attempt ${attempts}/${maxRetries} failed: ${error.message}`);
      if (attempts >= maxRetries) {
        console.error('❌ MongoDB Atlas connection failed after all retries:', error.message);
        process.exit(1);
      }
      console.log(`Retrying in ${retryDelayMs / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
};

export default connectDatabase;
