import "server-only";
import { db } from "@/lib/db";
import type { BlogPost } from "@/data/blog";

function toBlogPost(p: {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  readTime: string;
  author: string;
  date: Date;
  content: { heading: string | null; body: string }[];
}): BlogPost {
  return {
    id: p.id,
    title: p.title,
    excerpt: p.excerpt,
    image: p.image,
    category: p.category,
    readTime: p.readTime,
    author: p.author,
    date: p.date.toISOString().slice(0, 10),
    content: p.content.map((c) => ({ heading: c.heading ?? undefined, body: c.body })),
  };
}

const withContent = { content: { orderBy: { order: "asc" as const } } };

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const rows = await db.blogPost.findMany({ include: withContent, orderBy: { date: "desc" } });
  return rows.map(toBlogPost);
}

export async function getBlogPostById(id: string): Promise<BlogPost | undefined> {
  const row = await db.blogPost.findUnique({ where: { id }, include: withContent });
  return row ? toBlogPost(row) : undefined;
}

export async function getBlogPostIds(): Promise<string[]> {
  const rows = await db.blogPost.findMany({ select: { id: true } });
  return rows.map((r) => r.id);
}
