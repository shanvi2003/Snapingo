"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { Download, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { deleteVoucherAction, uploadVoucherAction, type FormState } from "@/lib/actions/vouchers";

export type VoucherRow = {
  id: string;
  label: string | null;
  fileName: string;
  size: number;
  uploadedBy: string;
  createdAt: string;
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function VoucherPanel({
  bookingId,
  vouchers,
  uploadsEnabled,
}: {
  bookingId: string;
  vouchers: VoucherRow[];
  uploadsEnabled: boolean;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    (prevState, formData) => uploadVoucherAction(bookingId, prevState, formData),
    undefined
  );
  const [removing, startRemove] = useTransition();
  const [fileName, setFileName] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
      <h2 className="font-heading text-base font-bold text-ink-900">Booking Vouchers</h2>
      <p className="mt-1 text-sm text-ink-500">
        Hotel, flight and cab confirmations. Stored privately — only staff can open them.
      </p>

      <div className="mt-4 space-y-2">
        {vouchers.map((voucher) => (
          <div
            key={voucher.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-ink-50/60 px-3 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <FileText className="h-4 w-4 shrink-0 text-ink-400" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-900">
                  {voucher.label || voucher.fileName}
                </p>
                <p className="text-xs text-ink-500">
                  {formatSize(voucher.size)} · {voucher.uploadedBy} · {voucher.createdAt}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Goes through the authenticated route, not the blob URL. */}
              <a
                href={`/api/admin/vouchers/${voucher.id}`}
                className="flex items-center gap-1.5 rounded-full border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:border-brand-400 hover:text-brand-600"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </a>
              <button
                type="button"
                disabled={removing}
                onClick={() => startRemove(() => deleteVoucherAction(voucher.id))}
                aria-label={`Delete ${voucher.fileName}`}
                className="grid h-8 w-8 place-items-center rounded-full text-ink-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {vouchers.length === 0 && <p className="text-sm text-ink-500">No vouchers uploaded yet.</p>}
      </div>

      {uploadsEnabled ? (
        <form ref={formRef} action={formAction} className="mt-5 border-t border-ink-100 pt-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-900" htmlFor="label">
                Label (optional)
              </label>
              <input
                id="label"
                name="label"
                placeholder="Hotel voucher — Manali"
                className="w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink-900" htmlFor="file">
                File (PDF or Word, up to 20 MB)
              </label>
              <input
                id="file"
                name="file"
                type="file"
                required
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
                className="w-full rounded-xl border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-900 file:mr-3 file:rounded-full file:border-0 file:bg-brand-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
              />
            </div>
          </div>

          {state && "error" in state && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{state.error}</p>
          )}
          {state && "success" in state && (
            <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
              {state.success}
            </p>
          )}

          <button
            type="submit"
            disabled={pending || !fileName}
            className="mt-3 flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {pending ? "Uploading..." : "Upload voucher"}
          </button>
        </form>
      ) : (
        <p className="mt-5 border-t border-ink-100 pt-4 text-sm text-ink-500">
          Voucher uploads need blob storage connected. Ask an admin to set it up.
        </p>
      )}
    </section>
  );
}
