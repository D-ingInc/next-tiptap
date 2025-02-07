import React, { useRef, useState } from "react";

interface UploadWidgetProps {
  onUploadSuccess: (url: string) => void;
}

export default function UploadWidget({ onUploadSuccess }: UploadWidgetProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64data = reader.result as string;
        // dataURL 形式の場合、プレフィックス "data:xxx;base64," を削除する
        const base64 = base64data.includes(",") ? base64data.split(",")[1] : base64data;
        const payload = {
          filename: file.name,
          data: base64,
          mimeType: file.type,
        };
        const res = await fetch("/api/upload-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (json.success) {
          onUploadSuccess(json.imageUrl);
        } else {
          console.error("アップロード失敗:", json.error);
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("アップロードエラー:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <button
        type="button"
        className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? "アップロード中" : "画像アップロード"}
      </button>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
} 