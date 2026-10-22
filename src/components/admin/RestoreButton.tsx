"use client";

import { useState, useTransition } from "react";
import { RotateCcw } from "lucide-react";
import ConfirmModal from "@/components/admin/ConfirmModal";

/**
 * Admin-only: brings an archived ("deleted") quotation or booking back. The
 * counterpart of DeleteButton - the action decides what is restored.
 */
export default function RestoreButton({
  id,
  action,
  confirmText,
}: {
  id: string;
  action: (id: string) => Promise<void>;
  confirmText: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => setOpen(true)}
        className="flex h-8 items-center gap-1.5 rounded-full border border-ink-200 px-3 text-xs font-semibold text-ink-700 transition hover:border-brand-400 hover:text-brand-600 disabled:opacity-50"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Restore
      </button>
      <ConfirmModal
        open={open}
        title="Confirm restore"
        confirmLabel="Restore"
        message={confirmText}
        pending={pending}
        onCancel={() => setOpen(false)}
        onConfirm={() =>
          startTransition(async () => {
            await action(id);
            setOpen(false);
          })
        }
      />
    </>
  );
}
