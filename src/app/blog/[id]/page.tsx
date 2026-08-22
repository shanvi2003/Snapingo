import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Calendar, User } from "lucide-react";
import { blogPosts, getBlogPostById } from "@/data/blog";
import DetailHero from "@/components/DetailHero";
import BlogCard from "@/components/BlogCard";

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = getBlogPostById(id);
  if (!post) return {};
  return {
    title: `${post.title} | Snapingo Blog`,
    description: post.excerpt,
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = getBlogPostById(id);
  if (!post) notFound();

  const related = blogPosts.filter((p) => p.id !== post.id && p.category === post.category);
  const relatedPosts = (related.length > 0
    ? related
    : blogPosts.filter((p) => p.id !== post.id)
  ).slice(0, 3);

  const formattedDate = new Date(post.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <DetailHero
        image={post.image}
        title={post.title}
        breadcrumb={[{ label: "Blog", href: "/blog" }, { label: post.title }]}
        meta={[
          { icon: <User />, label: post.author },
          { icon: <Calendar />, label: formattedDate },
        ]}
      />

      <article className="py-16 sm:py-20">
        <div className="container-app">
          <div>
            <p className="text-lg leading-relaxed text-ink-900">{post.excerpt}</p>
            <div className="mt-8 space-y-7">
              {post.content.map((block, i) => (
                <div key={i}>
                  {block.heading && (
                    <h2 className="mb-2 font-heading text-xl font-bold text-ink-900 sm:text-2xl">
                      {block.heading}
                    </h2>
                  )}
                  <p className="text-base leading-relaxed text-ink-900">{block.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <section className="bg-ink-50/60 py-16 sm:py-20">
          <div className="container-app">
            <h2 className="font-heading text-2xl font-bold text-ink-900 sm:text-3xl">
              Related stories
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.map((p, i) => (
                <BlogCard key={p.id} post={p} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
