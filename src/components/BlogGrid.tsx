"use client";

import { useMemo, useState } from "react";
import { blogPosts } from "@/data/blog";
import BlogCard from "@/components/BlogCard";

export default function BlogGrid() {
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(blogPosts.map((p) => p.category)))],
    []
  );
  const [category, setCategory] = useState("All");

  const list = useMemo(
    () => (category === "All" ? blogPosts : blogPosts.filter((p) => p.category === category)),
    [category]
  );

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
              category === c
                ? "bg-brand-600 text-white shadow-brand"
                : "border border-ink-100 bg-white text-ink-900 hover:text-brand-600"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((post, i) => (
          <BlogCard key={post.id} post={post} index={i} />
        ))}
      </div>
    </div>
  );
}
