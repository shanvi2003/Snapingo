"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { saveInvoiceAction, type FormState } from "@/lib/actions/invoices";
import { checkInstallmentTotal } from "@/lib/validation/invoice";
import { formatRupees } from "@/lib/gst";

const inputClass =
  "w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1 block text-xs font-bold uppercase tracking-wide text-ink-900";

type Row = { dueDate: string; amount: string };

export type InvoiceDefaults = {
  billingName: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingCountry: string;
  billingPincode: string;
  installments: Row[];
};

export default function InvoiceForm({
  bookingId,
  expectedTotal,
  defaults,
}: {
  bookingId: string;
  expectedTotal: number;
  defaults: InvoiceDefaults;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveInvoiceAction, undefined);

  const [rows, setRows] = useState<Row[]>(
    defaults.installments.length > 0 ? defaults.installments : [{ dueDate: "", amount: "" }]
  );

  const parsed = rows.map((r) => ({ amount: Math.round(Number(r.amount) || 0) }));
  // The same check the server runs, shown live so staff can correct the plan
  // before submitting instead of being told after. The server still decides -
  // this is a convenience, not the enforcement point.
  const totalIssue = checkInstallmentTotal(parsed, expectedTotal);
  const allocated = parsed.reduce((sum, r) => sum + r.amount, 0);

  const update = (index: number, key: keyof Row, value: string) =>
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="installments" value={JSON.stringify(rows)} />

      <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
        <h2 className="font-heading text-base font-bold text-ink-900">Billing details</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="billingName">Name</label>
            <input id="billingName" name="billingName" required defaultValue={defaults.billingName} className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="billingAddress">Address</label>
            <textarea id="billingAddress" name="billingAddress" rows={2} required defaultValue={defaults.billingAddress} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="billingCity">City</label>
            <input id="billingCity" name="billingCity" required defaultValue={defaults.billingCity} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="billingState">State</label>
            <input id="billingState" name="billingState" required defaultValue={defaults.billingState} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="billingCountry">Country</label>
            <input id="billingCountry" name="billingCountry" required defaultValue={defaults.billingCountry} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="billingPincode">Pincode</label>
            <input id="billingPincode" name="billingPincode" required defaultValue={defaults.billingPincode} className={inputClass} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading text-base font-bold text-ink-900">Installments</h2>
          <p className="text-sm text-ink-500">
            Booking total <span className="font-bold text-ink-900">{formatRupees(expectedTotal)}</span>
          </p>
        </div>

        <div className="mt-4 space-y-3">
          {rows.map((row, index) => (
            <div key={index} className="flex flex-wrap items-end gap-3 rounded-xl border border-ink-200 bg-ink-50/40 p-3">
              <div className="min-w-[150px] flex-1">
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-ink-500">
                  Installment {index + 1} — date
                </label>
                <input
                  type="date"
                  value={row.dueDate}
                  onChange={(e) => update(index, "dueDate", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="min-w-[150px] flex-1">
                <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-ink-500">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={row.amount}
                  onChange={(e) => update(index, "amount", e.target.value)}
                  className={inputClass}
                />
              </div>
              <button
                type="button"
                onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
                aria-label={`Remove installment ${index + 1}`}
                className="mb-1 grid h-9 w-9 shrink-0 place-items-center rounded-full text-ink-400 transition hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setRows((prev) => [...prev, { dueDate: "", amount: "" }])}
            className="flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:text-brand-700"
          >
            <Plus className="h-3.5 w-3.5" />
            Add installment
          </button>
          <p className="text-sm text-ink-700">
            Allocated <span className="font-bold text-ink-900">{formatRupees(allocated)}</span>
          </p>
        </div>

        {totalIssue && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">{totalIssue}</p>
        )}
      </section>

      {state && "error" in state && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        // Disabled while the plan doesn't balance, since the server would
        // refuse it anyway - this just makes the reason visible first.
        disabled={pending || Boolean(totalIssue)}
        className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save Invoice"}
      </button>
    </form>
  );
}
