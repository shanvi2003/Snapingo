"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { BlogPost } from "@/data/blog";
import { useRevealOnView } from "@/hooks/useRevealOnView";

export default function BlogCard({ post, index = 0 }: { post: BlogPost; index?: number }) {
  const { ref, style } = useRevealOnView<HTMLDivElement>({
    y: 24,
    duration: 0.5,
    delay: (index % 6) * 0.08,
    margin: "-60px",
  });

  return (
    <div ref={ref} style={style}>
      <Link
        href={`/blog/${post.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm transition hover:shadow-soft"
      >
        <div className="relative aspect-[16/10] overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            quality={85}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-700 group-hover:scale-110"
          />
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-semibold text-brand-600 shadow">
            {post.category}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-5 3xl:p-6">
          <h3 className="font-heading text-lg font-bold leading-snug text-ink-900 transition group-hover:text-brand-600 3xl:text-xl">
            {post.title}
          </h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-900 3xl:text-base">{post.excerpt}</p>
          <div className="mt-4 flex items-center justify-end border-t border-ink-100 pt-4">
            <span className="flex items-center gap-1 text-xs font-semibold text-brand-600 3xl:text-sm">
              Read more
              <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
