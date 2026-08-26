"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";

export default function DeleteButton({
  id,
  action,
  confirmText,
}: {
  id: string;
  action: (id: string) => Promise<void>;
  confirmText: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm(confirmText)) startTransition(() => action(id));
      }}
      className="grid h-8 w-8 place-items-center rounded-full text-ink-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
      aria-label="Delete"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
