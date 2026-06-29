import dotenv from 'dotenv';
dotenv.config();

const required = [
  'MONGODB_URI',
  'JWT_SECRET',
  'AWS_REGION',
  'S3_BUCKET_NAME',
  'OPENROUTER_API_KEY',
  'GEMINI_API_KEY',
];

for (const key of required) {
  if (!process.env[key]) {
    console.warn(`⚠️  Missing required env variable: ${key}`);
  }
}

const env = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // MongoDB
  mongoUri: process.env.MONGODB_URI,

  // JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  jwtRememberMeExpiresIn: process.env.JWT_REMEMBER_ME_EXPIRES_IN || '30d',

  // Google OAuth
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',

  // AWS
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,

  // S3
  s3BucketName: process.env.S3_BUCKET_NAME,
  s3UploadPrefix: process.env.S3_UPLOAD_PREFIX || 'uploads',

  // Bedrock
  bedrockRegion: process.env.BEDROCK_REGION || 'us-east-1',
  bedrockClaudeModelId: process.env.BEDROCK_CLAUDE_MODEL_ID || 'anthropic.claude-3-5-sonnet-20240620-v1:0',
  bedrockTitanModelId: process.env.BEDROCK_TITAN_MODEL_ID || 'amazon.titan-embed-text-v2:0',
  bedrockTitanDimensions: parseInt(process.env.BEDROCK_TITAN_DIMENSIONS, 10) || 1024,

  // AI Providers
  openRouterApiKey: process.env.OPENROUTER_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
  groqApiKey: process.env.GROQ_API_KEY,
  chatModel: process.env.CHAT_MODEL || 'llama-3.1-8b-instant',
  extractionModel: process.env.EXTRACTION_MODEL || 'qwen/qwen3-next-80b-a3b-instruct:free',
  architectureReviewModel: process.env.ARCH_REVIEW_MODEL || 'gemini-2.5-flash',

  // Email
  smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
  smtpPort: parseInt(process.env.SMTP_PORT, 10) || 587,
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  emailFrom: process.env.EMAIL_FROM || 'noreply@archreview.ai',

  // Client
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};

export default env;
