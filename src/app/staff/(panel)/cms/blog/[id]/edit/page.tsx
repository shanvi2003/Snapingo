import { notFound } from "next/navigation";
import { requireStaffFeature } from "@/lib/dal";
import { db } from "@/lib/db";
import BlogPostForm from "@/components/admin/cms/BlogPostForm";

export default async function StaffEditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaffFeature("blogEdit");
  const { id } = await params;
  const post = await db.blogPost.findUnique({ where: { id }, include: { content: { orderBy: { order: "asc" } } } });
  if (!post) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">Edit Blog Post</h1>
      <BlogPostForm
        isNew={false}
        defaults={{
          id: post.id,
          title: post.title,
          excerpt: post.excerpt,
          image: post.image,
          category: post.category,
          readTime: post.readTime,
          author: post.author,
          date: post.date.toISOString(),
          content: post.content.map((c) => ({ heading: c.heading ?? "", body: c.body })),
        }}
      />
    </div>
  );
}
