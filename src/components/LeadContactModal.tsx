"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useScrollLock } from "@/hooks/useScrollLock";
import LeadContactFields, { emptyContactValues, isContactValid, type ContactValues } from "@/components/LeadContactFields";

// Used by every "one click -> WhatsApp" CTA that has no multi-step popup of
// its own (Hotel/Flight results, Package Interest sticky bar) - it interrupts
// that single click just long enough to collect a name/phone/email before
// handing off to WhatsApp, instead of letting the click fire the redirect
// (and an empty lead) immediately.
export default function LeadContactModal({
  open,
  title,
  subtitle,
  submitLabel = "Continue on WhatsApp",
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  submitLabel?: string;
  onClose: () => void;
  onSubmit: (values: ContactValues) => void;
}) {
  const [values, setValues] = useState<ContactValues>(emptyContactValues);
  const [touched, setTouched] = useState(false);
  const [sending, setSending] = useState(false);

  useScrollLock(open);

  const handleSubmit = () => {
    if (!isContactValid(values)) {
      setTouched(true);
      return;
    }
    if (sending) return;
    setSending(true);
    onSubmit(values);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-950/60 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[85vh] w-full max-w-sm flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-h-[90vh] sm:rounded-3xl"
          >
            <div className="flex items-start justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-6">
              <div>
                <h2 className="font-heading text-base font-bold text-ink-900 sm:text-lg">{title}</h2>
                {subtitle && <p className="mt-1 text-sm text-ink-600">{subtitle}</p>}
              </div>
              <button
                type="button"
                aria-label="Close"
                onClick={onClose}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-700 transition hover:bg-ink-100"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
              <LeadContactFields values={values} onChange={setValues} touched={touched} />
            </div>

            <div className="border-t border-ink-100 px-4 py-3 sm:px-6 sm:py-4">
              <button
                type="button"
                disabled={sending}
                onClick={handleSubmit}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition hover:-translate-y-0.5 hover:bg-brand-700 disabled:pointer-events-none disabled:opacity-40 sm:py-3.5"
              >
                {submitLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
