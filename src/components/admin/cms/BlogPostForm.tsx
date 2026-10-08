"use client";

import { useActionState } from "react";
import { saveBlogPostAction, type FormState } from "@/lib/actions/cms";
import ImageUrlField from "@/components/admin/cms/ImageUrlField";
import RepeatableRows from "@/components/admin/cms/RepeatableRows";
import FormSection from "@/components/admin/FormSection";

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
    <form action={formAction} className="mt-6 w-full space-y-6">
      <FormSection title="Basic details">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="id">Post ID</label>
            <input
              id="id"
              name="id"
              required
              readOnly={!isNew}
              defaultValue={defaults?.id}
              placeholder="b7"
              className={`${inputClass} ${!isNew ? "bg-ink-50 text-ink-400" : ""}`}
            />
          </div>
          {/* Two columns: a blog title is a full sentence ("A First-Timer's
              Guide to..."), not a short label like the post ID. */}
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="title">Blog Title</label>
            <input id="title" name="title" required defaultValue={defaults?.title} placeholder="10 Hidden Beaches in Goa Only Locals Know About" className={inputClass} />
          </div>
        </div>

        <div className="mt-5">
          <label className={labelClass} htmlFor="excerpt">Short Summary</label>
          <textarea id="excerpt" name="excerpt" rows={3} required defaultValue={defaults?.excerpt} className={inputClass} />
        </div>
      </FormSection>

      <FormSection title="Post details">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={labelClass} htmlFor="category">Blog Category</label>
            <input id="category" name="category" required defaultValue={defaults?.category} placeholder="Beach Guide" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="author">Written By</label>
            <input id="author" name="author" required defaultValue={defaults?.author} placeholder="Snapingo Travel Desk" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="date">Publish Date</label>
            <input id="date" name="date" type="date" required defaultValue={defaults?.date?.slice(0, 10)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="readTime">Reading Time</label>
            <input id="readTime" name="readTime" required placeholder="6 min read" defaultValue={defaults?.readTime} className={inputClass} />
          </div>
        </div>
      </FormSection>

      <FormSection title="Cover image">
        <ImageUrlField name="image" label="Cover Image" defaultValue={defaults?.image} required />
      </FormSection>

      <FormSection title="Content">
        <RepeatableRows
          name="content"
          addLabel="Add Section"
          stacked
          large
          fields={[
            { key: "heading", label: "Section Heading (optional)", type: "text" },
            { key: "body", label: "Section Text", type: "textarea" },
          ]}
          initialRows={defaults?.content ?? []}
        />
      </FormSection>

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
