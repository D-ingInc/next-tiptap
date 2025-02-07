import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Prisma Client の初期化
const prisma = new PrismaClient();

// S3 クライアントの初期化（Minio 用にエンドポイントを指定）
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  endpoint: process.env.AWS_S3_ENDPOINT, // 例: "http://localhost:9000"
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "minioadmin",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "minioadmin",
  },
});

export async function POST(req: Request) {
  try {
    // リクエストボディから記事情報を取得
    const { title, content, imageFile } = await req.json();

    let imageUrl: string | null = null;
    if (imageFile) {
      // imageFile は { filename, data, mimeType } の形式を期待
      const { filename, data, mimeType } = imageFile;
      const buffer = Buffer.from(data, "base64");
      const bucketName = process.env.AWS_S3_BUCKET || "articles";

      // S3（Minio）に画像をアップロード
      const uploadParams = {
        Bucket: bucketName,
        Key: filename,
        Body: buffer,
        ContentType: mimeType,
      };

      await s3Client.send(new PutObjectCommand(uploadParams));

      // アップロード後の画像 URL を生成
      imageUrl = `${process.env.AWS_S3_ENDPOINT}/${bucketName}/${filename}`;
    }

    // Prisma を使って Post レコードを作成
    const post = await prisma.post.create({
      data: {
        title,
        content,
        imageUrl, // 画像がアップロードされていれば URL を保存
      },
    });

    return NextResponse.json({ success: true, post });
  } catch (error) {
    console.error("Error saving post:", error);
    return NextResponse.json(
      { success: false, error: "記事保存に失敗しました" },
      { status: 500 }
    );
  }
} 