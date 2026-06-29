import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';

import env from './src/config/env.js';
import connectDatabase from './src/config/database.js';
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler.js';
import { generalLimiter } from './src/middleware/rateLimiter.js';

// Route imports
import authRoutes from './src/routes/authRoutes.js';
import projectRoutes from './src/routes/projectRoutes.js';
import documentRoutes from './src/routes/documentRoutes.js';
import reviewRoutes from './src/routes/reviewRoutes.js';
import chatRoutes from './src/routes/chatRoutes.js';
import knowledgeBaseRoutes from './src/routes/knowledgeBaseRoutes.js';
import settingsRoutes from './src/routes/settingsRoutes.js';

const app = express();

// ─── Security & Parsing ─────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
// Define trusted origins for CORS
const allowedOrigins = [
  env.clientUrl,
  'http://localhost:5173', // Local dev frontend
  'http://localhost:3000'  // Alternative local dev
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || (env.isProduction === false && origin.startsWith('http://localhost:'))) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS. Origin not in trusted list.'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// ─── Logging ─────────────────────────────────────────────────
if (env.nodeEnv !== 'test') {
  app.use(morgan(env.isProduction ? 'combined' : 'dev'));
}

// ─── Rate Limiting ───────────────────────────────────────────
app.use('/api/', generalLimiter);

// ─── Health Check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: env.nodeEnv,
      version: '1.0.0',
    },
  });
});

// ─── API Routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects', documentRoutes);     // /api/projects/:projectId/documents
app.use('/api/projects', reviewRoutes);       // /api/projects/:projectId/reviews
app.use('/api/chat', chatRoutes);
app.use('/api/knowledge-base', knowledgeBaseRoutes);
app.use('/api/settings', settingsRoutes);

// ─── Error Handling ──────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────
const start = async () => {
  await connectDatabase();

  app.listen(env.port, () => {
    console.log(`
╔═══════════════════════════════════════════════════════╗
║   🏗️  AI Architecture Review Assistant                ║
║   Server running on port ${env.port}                       ║
║   Environment: ${env.nodeEnv.padEnd(38)}║
║   API: http://localhost:${env.port}/api                    ║
╚═══════════════════════════════════════════════════════╝
    `);
  });
};

start().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});

export default app;
