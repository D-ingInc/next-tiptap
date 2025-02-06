import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/utils/s3-client";

const isProduction = process.env.NODE_ENV === 'production';
const BUCKET_NAME = isProduction ? process.env.AWS_S3_BUCKET! : process.env.MINIO_BUCKET!;

export async function uploadFile(file: Buffer, fileName: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `posts/images/${fileName}`,
    Body: file,
    ContentType: 'image/jpeg',
  });

  await s3Client.send(command);

  const baseUrl = isProduction 
    ? `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com`
    : process.env.MINIO_ENDPOINT;

  return `${baseUrl}/posts/images/${fileName}`;
}