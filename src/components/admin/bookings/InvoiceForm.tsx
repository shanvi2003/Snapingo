"use client";

import { useActionState, useState } from "react";
import { saveInvoiceAction, type FormState } from "@/lib/actions/invoices";
import { checkInstallmentTotal } from "@/lib/validation/invoice";
import { formatRupees } from "@/lib/gst";
import FormSection from "@/components/admin/FormSection";
import CustomSelect from "@/components/CustomSelect";

const inputClass =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-900";

// More than a year of monthly payments is not a real plan for a trip.
const MAX_INSTALLMENTS = 12;
const countOptions = Array.from({ length: MAX_INSTALLMENTS }, (_, i) => ({
  value: String(i + 1),
  label: String(i + 1),
}));

type Row = { dueDate: string; amount: string };
const blankRow = (): Row => ({ dueDate: "", amount: "" });

export type InvoiceDefaults = {
  billingName: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingCountry: string;
  billingPincode: string;
  installments: Row[];
};

// Shown read-only above the billing form, so staff can see whose invoice
// this is while filling it in.
export type InvoiceCustomer = { tripId: string | null; name: string; email: string | null };

// The value styled like a filled-in input, but not editable.
const readOnlyClass = "rounded-xl border border-ink-200 bg-ink-50 px-4 py-3 text-sm font-semibold text-ink-900";

export default function InvoiceForm({
  bookingId,
  expectedTotal,
  customer,
  defaults,
}: {
  bookingId: string;
  expectedTotal: number;
  customer: InvoiceCustomer;
  defaults: InvoiceDefaults;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(saveInvoiceAction, undefined);

  const [rows, setRows] = useState<Row[]>(
    defaults.installments.length > 0 ? defaults.installments : [blankRow()]
  );

  const parsed = rows.map((r) => ({ amount: Math.round(Number(r.amount) || 0) }));
  // The same check the server runs, shown live so staff can correct the plan
  // before submitting instead of being told after. The server still decides -
  // this is a convenience, not the enforcement point.
  const totalIssue = checkInstallmentTotal(parsed, expectedTotal);
  const allocated = parsed.reduce((sum, r) => sum + r.amount, 0);

  // Picking the number of installments grows or trims the rows, keeping
  // whatever was already typed into the ones that stay.
  const setCount = (value: string) => {
    const count = Number(value);
    setRows((prev) =>
      count > prev.length
        ? [...prev, ...Array.from({ length: count - prev.length }, blankRow)]
        : prev.slice(0, count)
    );
  };

  const update = (index: number, key: keyof Row, value: string) =>
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="installments" value={JSON.stringify(rows)} />

      <FormSection title="Customer Details">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <p className={labelClass}>Trip ID</p>
            <p className={`${readOnlyClass} font-mono text-brand-600`}>{customer.tripId ?? "N/A"}</p>
          </div>
          <div>
            <p className={labelClass}>Customer Name</p>
            <p className={readOnlyClass}>{customer.name}</p>
          </div>
          <div>
            <p className={labelClass}>Email</p>
            <p className={`${readOnlyClass} truncate`}>{customer.email || "N/A"}</p>
          </div>
        </div>
      </FormSection>

      <FormSection title="Billing Details">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="billingName">Name</label>
            <input id="billingName" name="billingName" required defaultValue={defaults.billingName} placeholder="Full name" className={inputClass} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="billingAddress">Address</label>
            <input
              id="billingAddress"
              name="billingAddress"
              required
              defaultValue={defaults.billingAddress}
              placeholder="House no., street, area"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="billingCity">City</label>
            <input id="billingCity" name="billingCity" required defaultValue={defaults.billingCity} placeholder="City" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="billingState">State</label>
            <input id="billingState" name="billingState" required defaultValue={defaults.billingState} placeholder="State" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="billingCountry">Country</label>
            <input id="billingCountry" name="billingCountry" required defaultValue={defaults.billingCountry} placeholder="Country" className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="billingPincode">Pincode</label>
            <input
              id="billingPincode"
              name="billingPincode"
              required
              inputMode="numeric"
              defaultValue={defaults.billingPincode}
              placeholder="6-digit pincode"
              className={inputClass}
            />
          </div>
        </div>
      </FormSection>

      <FormSection title="Installments">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
          <div>
            <p className={labelClass}>Total Amount</p>
            <p className={readOnlyClass}>{formatRupees(expectedTotal)}</p>
          </div>
          <div>
            <p className={labelClass}>Number of Installments</p>
            <CustomSelect
              value={String(rows.length)}
              onChange={setCount}
              options={countOptions}
            />
          </div>
        </div>

        {/* Same four columns as Billing Details, so every box on the page
            lines up: the row name sits under Total Amount, the date and the
            amount in the next two columns. */}
        <div className="mt-6 border-t border-ink-100 pt-5">
          <div className="hidden grid-cols-4 gap-5 sm:grid">
            <span />
            <p className={labelClass}>Due Date</p>
            <p className={labelClass}>Amount (₹)</p>
          </div>
          <div className="space-y-3">
            {rows.map((row, index) => (
              <div key={index} className="grid grid-cols-1 items-center gap-3 sm:grid-cols-4 sm:gap-5">
                <p className="text-sm font-semibold text-ink-900">Installment {index + 1}</p>
                <input
                  type="date"
                  aria-label={`Installment ${index + 1} due date`}
                  value={row.dueDate}
                  onChange={(e) => update(index, "dueDate", e.target.value)}
                  className={inputClass}
                />
                <input
                  type="number"
                  min={0}
                  aria-label={`Installment ${index + 1} amount`}
                  value={row.amount}
                  onChange={(e) => update(index, "amount", e.target.value)}
                  placeholder="0"
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </div>

        {/* One line: green once the installments add up, amber with the
            shortfall or excess until then. */}
        <p
          className={`mt-5 rounded-lg px-4 py-2.5 text-sm font-medium ${
            totalIssue ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {totalIssue ?? `Installments add up to the total, ${formatRupees(allocated)}.`}
        </p>
      </FormSection>

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
