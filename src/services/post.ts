import { mock } from "@/sample";
import { Post } from "@/types/post";

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

export interface SavePostData extends Omit<Post, 'id' | 'createdAt' | 'updatedAt'> {
  cover?: File | null;
}

const getBaseUrl = () => {
  if (typeof window !== 'undefined') return ''; // ブラウザでは相対パスを使用
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // Vercel環境
  return `http://localhost:${process.env.PORT || 3000}`; // 開発環境
};

// 一時保存用の関数（ローカルストレージ使用）
export const saveDraft = (data: SavePostData) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("post", JSON.stringify({
      ...data,
      createdAt: new Date().toISOString(),
      author: "Anonymous"
    }));
  } catch (error) {
    console.error("Error saving draft:", error);
  }
};

// APIを使用した永続化
export const savePost = async (data: SavePostData) => {
  try {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('content', data.content);
    formData.append('author', 'Anonymous');
    if (data.cover instanceof File) {
      formData.append('cover', data.cover);
    }

    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/posts`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to save post');
    }

    return await response.json() as Post;
  } catch (error) {
    console.error('Error saving post:', error);
    throw error;
  }
};

// 記事一覧を取得する関数を追加
export const getPosts = async (): Promise<Post[]> => {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/posts`, {
      // サーバーコンポーネントでのキャッシュを無効化
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch posts');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
};

export const getPostById = async (id: string): Promise<Post> => {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/posts/${id}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch post');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
};
