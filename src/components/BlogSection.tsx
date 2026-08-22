import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { blogPosts } from "@/data/blog";
import SectionHeading from "@/components/SectionHeading";
import BlogCard from "@/components/BlogCard";

export default function BlogSection() {
  return (
    <section id="blog" className="scroll-mt-24 bg-white pb-20 pt-8 sm:pb-24 sm:pt-10">
      <div className="container-app">
        <SectionHeading
          title="Ideas & inspiration for your next trip"
          subtitle="Guides, itineraries and tips from the Snapingo travel desk."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {blogPosts.slice(0, 3).map((post, i) => (
            <BlogCard key={post.id} post={post} index={i} />
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 rounded-full border border-ink-200 px-6 py-3 text-sm font-semibold text-ink-700 transition hover:border-brand-500 hover:text-brand-600"
          >
            Read all articles
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}
