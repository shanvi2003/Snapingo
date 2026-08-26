"use client";

import { useActionState } from "react";
import { saveBlogPostAction, type FormState } from "@/lib/actions/cms";
import ImageUrlField from "@/components/admin/cms/ImageUrlField";
import RepeatableRows from "@/components/admin/cms/RepeatableRows";

const inputClass =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-900";

export type BlogPostDefaults = {
  id?: string;
  title?: string;
  excerpt?: string;
  image?: string;
  category?: string;
  readTime?: string;
  author?: string;
  date?: string;
  content?: { heading: string; body: string }[];
};

export default function BlogPostForm({ isNew, defaults }: { isNew: boolean; defaults?: BlogPostDefaults }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    (prevState, formData) => saveBlogPostAction(isNew, prevState, formData),
    undefined
  );

  return (
    <form action={formAction} className="mt-6 max-w-3xl space-y-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="id">Post ID (URL slug)</label>
          <input id="id" name="id" required disabled={!isNew} defaultValue={defaults?.id} placeholder="b7" className={`${inputClass} disabled:bg-ink-50 disabled:text-ink-400`} />
        </div>
        <div>
          <label className={labelClass} htmlFor="title">Title</label>
          <input id="title" name="title" required defaultValue={defaults?.title} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="excerpt">Excerpt</label>
        <textarea id="excerpt" name="excerpt" rows={2} required defaultValue={defaults?.excerpt} className={inputClass} />
      </div>

      <ImageUrlField name="image" label="Cover Image URL" defaultValue={defaults?.image} required />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <div>
          <label className={labelClass} htmlFor="category">Category</label>
          <input id="category" name="category" required defaultValue={defaults?.category} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="readTime">Read Time</label>
          <input id="readTime" name="readTime" required placeholder="6 min read" defaultValue={defaults?.readTime} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="author">Author</label>
          <input id="author" name="author" required defaultValue={defaults?.author} className={inputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="date">Date</label>
          <input id="date" name="date" type="date" required defaultValue={defaults?.date?.slice(0, 10)} className={inputClass} />
        </div>
      </div>

      <div>
        <p className={labelClass}>Content Sections</p>
        <RepeatableRows
          name="content"
          addLabel="Add Section"
          fields={[
            { key: "heading", label: "Heading (optional)", type: "text" },
            { key: "body", label: "Body", type: "textarea" },
          ]}
          initialRows={defaults?.content ?? []}
        />
      </div>

      {state?.error && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Saving..." : isNew ? "Create Post" : "Save Changes"}
      </button>
    </form>
  );
}
