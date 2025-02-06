export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  cover: string | null;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
} 