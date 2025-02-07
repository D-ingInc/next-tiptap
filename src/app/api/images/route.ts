import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

export const dynamic = "force-dynamic";

// S3 クライアントの初期化（Minio 用にエンドポイントを指定）
const s3Client = new S3Client({
  region: process.env.MINIO_REGION || "ap-northeast-1",
  endpoint: process.env.MINIO_ENDPOINT, // 例: "http://localhost:9000"
  forcePathStyle: true,  // 追加：MinIOでは必須
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "minioadmin",
  },
});

export async function GET() {
  try {
    const bucketName = process.env.MINIO_BUCKET || "blog-assets";
    const data = await s3Client.send(new ListObjectsV2Command({ Bucket: bucketName }));
    const contents = data.Contents || [];
    // 各オブジェクトから必要なメタ情報を生成する
    const images = contents.map((item) => {
      const key = item.Key!;
      const url = `${process.env.MINIO_ENDPOINT}/${bucketName}/${key}`;
      const format = key.split(".").pop() || "";
      const display_name = key.replace(/\.\w+$/, "");
      return {
        id: key,
        url,
        created_at: item.LastModified ? item.LastModified.toISOString() : "",
        bytes: item.Size,
        format,
        display_name,
        width: 0,  // 画像の幅はバックエンド側で取得していないため0を設定
        height: 0, // 同上
      };
    });
    return NextResponse.json(images);
  } catch (error) {
    console.error("Error fetching images from S3:", error);
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // フォームデータからファイルオブジェクトを取得
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // ファイルの内容をバッファに変換
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const bucketName = process.env.MINIO_BUCKET || "blog-assets";
    // S3 に保存する際は、ファイル名をキーとして使用（必要に応じてユニークなIDを付与してください）
    const filename = file.name;
    const fileKey = filename;

    // S3 にアップロードするためのパラメータ
    const uploadParams = {
      Bucket: bucketName,
      Key: fileKey,
      Body: buffer,
      ContentType: file.type,
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    // S3 からアクセス可能な画像URL を生成
    const imageUrl = `${process.env.MINIO_ENDPOINT}/${bucketName}/${fileKey}`;
    // 画面表示用のメタデータを作成（format, display_name など）
    const format = filename.split(".").pop() || "";
    const display_name = filename.replace(/\.\w+$/, "");

    return NextResponse.json({
      id: fileKey,
      url: imageUrl,
      created_at: new Date().toISOString(),
      bytes: buffer.length,
      format: format,
      display_name: display_name,
      width: 0,  // バックエンド側で画像の幅は取得していないため0を設定
      height: 0, // 同上
    });
  } catch (error) {
    console.error("画像アップロードエラー:", error);
    return NextResponse.json(
      { error: "画像アップロードに失敗しました" },
      { status: 500 }
    );
  }
}
