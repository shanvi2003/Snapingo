"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

// The admin panel's own styled stand-in for window.confirm() - a native
// browser confirm() can't be restyled at all (it shows the raw page origin,
// e.g. "localhost:3000 says", which looks broken/unbranded next to the rest
// of this panel), and it blocks the whole tab's JS thread while open.
export default function ConfirmModal({
  open,
  title = "Confirm delete",
  message,
  confirmLabel = "Delete",
  pending,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={() => !pending && onCancel()}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-950/60 p-4"
        >
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-heading text-base font-bold text-ink-900">{title}</h2>
              <button
                type="button"
                aria-label="Close"
                onClick={onCancel}
                disabled={pending}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-ink-400 transition hover:bg-ink-100 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">{message}</p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={pending}
                className="rounded-full px-4 py-2 text-sm font-semibold text-ink-600 transition hover:bg-ink-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={pending}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {pending ? "Deleting..." : confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
