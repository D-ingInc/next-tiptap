import { getPostById } from "@/services/post";
import { formatDate } from "@/utils/date";
import { notFound } from "next/navigation";
import Image from "next/image";
import { LuCalendarDays, LuClock } from "react-icons/lu";

interface PostPageProps {
  params: {
    id: string;
  };
}

export default async function PostPage({ params }: PostPageProps) {
  try {
    const post = await getPostById(params.id);
    const readingTime = Math.ceil(post.wordCount / 150); // 1分あたり150単語で計算

    return (
      <article className="max-w-4xl mx-auto py-10 px-6">
        <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <LuCalendarDays size={18} />
            <span>{formatDate(post.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <LuClock size={18} />
            <span>{readingTime}分で読めます</span>
          </div>
        </div>

        {post.cover && (
          <div className="mb-8">
            <Image
              src={post.cover}
              alt={post.title}
              width={1200}
              height={630}
              className="rounded-lg"
              priority
            />
          </div>
        )}

        <div 
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    );
  } catch (error) {
    notFound();
  }
} 