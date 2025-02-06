import { S3Client } from "@aws-sdk/client-s3";

const isProduction = process.env.NODE_ENV === 'production';

export const s3Client = new S3Client({
  region: isProduction ? process.env.AWS_REGION! : 'us-east-1',
  endpoint: isProduction ? undefined : process.env.MINIO_ENDPOINT,
  credentials: {
    accessKeyId: isProduction ? process.env.AWS_ACCESS_KEY_ID! : process.env.MINIO_ACCESS_KEY!,
    secretAccessKey: isProduction ? process.env.AWS_SECRET_ACCESS_KEY! : process.env.MINIO_SECRET_KEY!,
  },
  forcePathStyle: !isProduction, // MinIOの場合は必要
});