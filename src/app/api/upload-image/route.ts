import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// S3 クライアントの初期化（Minio 用にエンドポイントを指定）
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-northeast-1",
  endpoint: process.env.AWS_S3_ENDPOINT, // 例: "http://localhost:9000"
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "minioadmin",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "minioadmin",
  },
});

// POST リクエストで画像アップロードを処理する
export async function POST(req: Request) {
  try {
    // リクエストボディから画像データを取得（{ filename, data, mimeType } の形式）
    const { filename, data, mimeType } = await req.json();
    const buffer = Buffer.from(data, "base64");
    const bucketName = process.env.AWS_S3_BUCKET || "images";

    // S3（MiniO）に画像をアップロード
    const uploadParams = {
      Bucket: bucketName,
      Key: filename,
      Body: buffer,
      ContentType: mimeType,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    // アップロード後の画像 URL を生成
    const imageUrl = `${process.env.AWS_S3_ENDPOINT}/${bucketName}/${filename}`;
    return NextResponse.json({ success: true, imageUrl });
  } catch (error) {
    console.error("画像アップロードエラー:", error);
    return NextResponse.json(
      { success: false, error: "画像アップロードに失敗しました" },
      { status: 500 }
    );
  }
} 