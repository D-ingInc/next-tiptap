import { getPosts } from "@/services/post";
import Link from "next/link";
import { formatDate } from "@/utils/date";
import { Post } from "@/types/post";

export default async function PostsPage() {
  const posts = await getPosts() as Post[];

  return (
    <div className="max-w-4xl mx-auto py-10 px-6">
      <h1 className="text-3xl font-bold mb-8">記事一覧</h1>
      <div className="grid gap-6">
        {posts.map((post: Post) => (
          <article key={post.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
            <Link href={`/posts/${post.id}`} className="block hover:opacity-80 transition-opacity">
              <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
              <div className="text-sm text-gray-500">
                <span>{formatDate(post.createdAt)}</span>
                <span className="mx-2">•</span>
                <span>{post.wordCount}文字</span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
} 