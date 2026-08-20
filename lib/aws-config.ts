import { S3Client } from '@aws-sdk/client-s3';

export const AWS_REGION = process.env.AWS_REGION || 'us-west-2';
export const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME || '';
export const AWS_FOLDER_PREFIX = process.env.AWS_FOLDER_PREFIX || '';

// The hosted environment provides credentials via the shared AWS profile.
// In the Node runtime the default credential provider chain resolves them.
export const s3Client = new S3Client({
  region: AWS_REGION,
});
