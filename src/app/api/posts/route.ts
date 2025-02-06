import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { uploadFile } from '@/lib/storage';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const author = formData.get('author') as string;
    const coverImage = formData.get('cover');

    let coverUrl = null;
    if (coverImage && coverImage instanceof Blob) {
      const buffer = Buffer.from(await coverImage.arrayBuffer());
      const fileName = `${Date.now()}-${coverImage.name}`;
      coverUrl = await uploadFile(buffer, fileName);
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        author,
        cover: coverUrl,
        wordCount: content.split(/\s+/).length,
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}