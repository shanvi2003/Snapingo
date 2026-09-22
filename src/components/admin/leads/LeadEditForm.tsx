"use client";

import { useActionState, useState } from "react";
import { Pencil, X } from "lucide-react";
import { updateLeadDetailsAction, type FormState } from "@/lib/actions/admin-leads";
import { statusLabels } from "@/components/admin/leads/statusStyles";
import CustomSelect from "@/components/CustomSelect";
import type { LeadStatus } from "@/generated/prisma/enums";

const inputClass =
  "w-full rounded-xl border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1 block text-xs font-bold uppercase tracking-wide text-ink-500";

export type LeadEditDefaults = {
  name: string;
  phone: string;
  email: string;
  status: LeadStatus;
  tripType: string;
  destinationName: string;
  startDate: string;
  endDate: string;
  month: string;
  days: string;
  packageTitle: string;
  adults: string;
  children: string;
  infants: string;
  childAges: string[];
  rooms: string;
  extraBeds: string;
  extraMattresses: string;
  roomCategory: string;
  hotelCategory: string;
  message: string;
};

type Option = { value: string; label: string };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className={labelClass}>{label}</p>
      {children}
    </div>
  );
}

export default function LeadEditForm({
  leadId,
  defaults,
  roomCategories,
  hotelCategories,
}: {
  leadId: string;
  defaults: LeadEditDefaults;
  roomCategories: Option[];
  hotelCategories: Option[];
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    (prevState, formData) => updateLeadDetailsAction(leadId, prevState, formData),
    undefined
  );

  // Read-only until Edit is pressed: staff have this page open while talking
  // to a customer, and a form that is always live invites edits made by
  // accidentally typing into it.
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<string>(defaults.status);
  const [roomCategory, setRoomCategory] = useState(defaults.roomCategory);
  const [hotelCategory, setHotelCategory] = useState(defaults.hotelCategory);

  const rows: [string, string][] = [
    ["Name", defaults.name],
    ["Phone", defaults.phone],
    ["Email", defaults.email],
    ["Trip type", defaults.tripType],
    ["Destination", defaults.destinationName],
    ["Start date", defaults.startDate],
    ["End date", defaults.endDate],
    ["Month", defaults.month],
    ["Duration", defaults.days],
    ["Package", defaults.packageTitle],
    [
      "Travellers",
      [
        defaults.adults && `${defaults.adults} adults`,
        defaults.children && `${defaults.children} children`,
        defaults.infants && `${defaults.infants} infants`,
        defaults.childAges.length ? `Ages: ${defaults.childAges.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join(" · "),
    ],
    [
      "Rooms",
      [
        defaults.rooms && `${defaults.rooms} rooms`,
        defaults.extraBeds && `${defaults.extraBeds} extra bed(s)`,
        defaults.extraMattresses && `${defaults.extraMattresses} extra mattress(es)`,
      ]
        .filter(Boolean)
        .join(" · "),
    ],
    [
      "Hotel / room category",
      [
        hotelCategories.find((c) => c.value === defaults.hotelCategory)?.label,
        roomCategories.find((c) => c.value === defaults.roomCategory)?.label,
      ]
        .filter(Boolean)
        .join(" · "),
    ],
  ];

  if (!editing) {
    return (
      <div>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-heading text-base font-bold text-ink-900">Submitted details</h2>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 rounded-full border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:border-brand-400 hover:text-brand-600"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        </div>

        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          {rows
            .filter(([, value]) => value)
            .map(([label, value]) => (
              <div key={label}>
                <dt className={labelClass}>{label}</dt>
                <dd className="text-sm text-ink-900">{value}</dd>
              </div>
            ))}
        </dl>

        {defaults.message && (
          <div className="mt-5 border-t border-ink-100 pt-4">
            <p className={labelClass}>Message</p>
            <p className="text-sm leading-relaxed text-ink-900">{defaults.message}</p>
          </div>
        )}

        {state && "success" in state && (
          <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
            {state.success}
          </p>
        )}
      </div>
    );
  }

  return (
    <form action={formAction}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-heading text-base font-bold text-ink-900">Edit details</h2>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="flex items-center gap-1.5 rounded-full border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:border-ink-300"
        >
          <X className="h-3.5 w-3.5" />
          Cancel
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input name="name" defaultValue={defaults.name} className={inputClass} />
        </Field>
        <Field label="Phone">
          <input name="phone" defaultValue={defaults.phone} className={inputClass} />
        </Field>
        <Field label="Email">
          <input name="email" type="email" defaultValue={defaults.email} className={inputClass} />
        </Field>
        <Field label="Status">
          <CustomSelect
            name="status"
            value={status}
            onChange={setStatus}
            options={(Object.keys(statusLabels) as LeadStatus[]).map((s) => ({
              value: s,
              label: statusLabels[s],
            }))}
          />
        </Field>
        <Field label="Trip type">
          <input name="tripType" defaultValue={defaults.tripType} className={inputClass} />
        </Field>
        <Field label="Destination">
          <input name="destinationName" defaultValue={defaults.destinationName} className={inputClass} />
        </Field>
        <Field label="Start date">
          <input name="startDate" type="date" defaultValue={defaults.startDate} className={inputClass} />
        </Field>
        <Field label="End date">
          <input name="endDate" type="date" defaultValue={defaults.endDate} className={inputClass} />
        </Field>
        <Field label="Month">
          <input name="month" defaultValue={defaults.month} className={inputClass} />
        </Field>
        <Field label="Duration">
          <input name="days" defaultValue={defaults.days} className={inputClass} />
        </Field>
        <Field label="Package">
          <input name="packageTitle" defaultValue={defaults.packageTitle} className={inputClass} />
        </Field>
      </div>

      <p className="mt-6 text-xs font-bold uppercase tracking-wide text-ink-900">Travellers & rooms</p>
      <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Field label="Adults">
          <input name="adults" type="number" min={0} defaultValue={defaults.adults} className={inputClass} />
        </Field>
        <Field label="Children">
          <input name="children" type="number" min={0} defaultValue={defaults.children} className={inputClass} />
        </Field>
        <Field label="Infants">
          <input name="infants" type="number" min={0} defaultValue={defaults.infants} className={inputClass} />
        </Field>
        <Field label="Rooms">
          <input name="rooms" type="number" min={0} defaultValue={defaults.rooms} className={inputClass} />
        </Field>
        <Field label="Extra beds">
          <input name="extraBeds" type="number" min={0} defaultValue={defaults.extraBeds} className={inputClass} />
        </Field>
        <Field label="Extra mattresses">
          <input
            name="extraMattresses"
            type="number"
            min={0}
            defaultValue={defaults.extraMattresses}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Child / infant ages (one per line)">
          <textarea name="childAges" rows={3} defaultValue={defaults.childAges.join("\n")} className={inputClass} />
        </Field>
        <Field label="Hotel category">
          <CustomSelect
            name="hotelCategory"
            value={hotelCategory}
            onChange={setHotelCategory}
            placeholder="—"
            options={[{ value: "", label: "—" }, ...hotelCategories]}
          />
        </Field>
        <Field label="Room category">
          <CustomSelect
            name="roomCategory"
            value={roomCategory}
            onChange={setRoomCategory}
            placeholder="—"
            options={[{ value: "", label: "—" }, ...roomCategories]}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Message">
          <textarea name="message" rows={3} defaultValue={defaults.message} className={inputClass} />
        </Field>
      </div>

      {state && "error" in state && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
