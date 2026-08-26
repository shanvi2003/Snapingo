import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { db } from "@/lib/db";
import DeleteButton from "@/components/admin/cms/DeleteButton";
import { deleteBlogPostAction } from "@/lib/actions/cms";

export default async function BlogListPage({ basePath = "/admin" }: { basePath?: string }) {
  const posts = await db.blogPost.findMany({ orderBy: { date: "desc" } });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink-900">Blog</h1>
          <p className="mt-1 text-sm text-ink-500">{posts.length} posts</p>
        </div>
        <Link href={`${basePath}/cms/blog/new`} className="flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">
          <Plus className="h-4 w-4" />
          New Post
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-xs font-bold uppercase tracking-wide text-ink-500">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
                <td className="px-4 py-3 font-semibold text-ink-900">{p.title}</td>
                <td className="px-4 py-3 text-ink-700">{p.category}</td>
                <td className="px-4 py-3 text-ink-500">{p.date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Link href={`${basePath}/cms/blog/${p.id}/edit`} className="grid h-8 w-8 place-items-center rounded-full text-ink-400 hover:bg-brand-50 hover:text-brand-600" aria-label="Edit">
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <DeleteButton id={p.id} action={deleteBlogPostAction} confirmText="Delete this blog post? This can't be undone." />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
