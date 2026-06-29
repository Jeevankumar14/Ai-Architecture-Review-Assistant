import { S3Client } from '@aws-sdk/client-s3';
import env from './env.js';

const awsCredentials = env.awsAccessKeyId && env.awsSecretAccessKey
  ? {
      accessKeyId: env.awsAccessKeyId,
      secretAccessKey: env.awsSecretAccessKey,
    }
  : undefined; // Falls back to default credential chain (IAM role, etc.)

export const s3Client = new S3Client({
  region: env.awsRegion,
  credentials: awsCredentials,
});

export default { s3Client };
