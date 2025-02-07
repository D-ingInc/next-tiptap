import { mock } from "@/sample";

export const getPost = (): Promise<any> => {
  return new Promise<any>((resolve) => {
    setTimeout(() => {
      if (typeof window !== "undefined") {
        try {
          const data = localStorage.getItem("post");
          resolve(data ? JSON.parse(data) : mock);
          if (!data) savePost(mock);
        } catch {
          resolve(mock);
        }
      }

      return resolve(mock);
    }, 200);
  });
};

export async function savePost(data: {
  title: string;
  content: string;
  imageFile?: { filename: string; data: string; mimeType: string };
}) {
  const response = await fetch("/api/articles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
}
