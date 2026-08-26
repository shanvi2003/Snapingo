"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { deleteTestimonialAction } from "@/lib/actions/reviews";

export default function DeleteTestimonialButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm("Delete this review? This can't be undone.")) {
          startTransition(() => deleteTestimonialAction(id));
        }
      }}
      className="grid h-8 w-8 place-items-center rounded-full text-ink-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      aria-label="Delete review"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
