"use client";

import { useEffect, useState } from "react";
import { Post } from "@/types/post";
import PostHeader from "@/components/shared/PostHeader";
import PostContent from "@/components/shared/PostContent";
import TiptapRenderer from "@/components/TiptapRenderer/ClientRenderer";

export default function PreviewPage() {
  const [post, setPost] = useState<Partial<Post> | null>(null);

  useEffect(() => {
    // ローカルストレージから下書きを取得
    const draft = localStorage.getItem("post");
    if (draft) {
      setPost(JSON.parse(draft));
    }
  }, []);

  if (!post) return null;

  const readingTime = Math.ceil((post.wordCount || 0) / 150);

  return (
    <article className="py-10 px-6 flex flex-col items-center">
      <PostHeader
        title={post.title || ""}
        author={post.author || "Anonymous"}
        createdAt={post.createdAt || new Date().toISOString()}
        readingTime={readingTime}
      />
      <div className="grid grid-cols-1 w-full lg:w-auto lg:grid-cols-[minmax(auto,256px)_minmax(720px,1fr)_minmax(auto,256px)] gap-6 lg:gap-8">
        <div /> {/* 左側の余白 */}
        <PostContent>
          <TiptapRenderer>{post.content || ""}</TiptapRenderer>
        </PostContent>
        <div /> {/* 右側の余白 */}
      </div>
    </article>
  );
} 