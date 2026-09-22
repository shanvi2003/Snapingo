"use client";

import { useActionState, useState } from "react";
import { saveCustomPackageAction, type FormState } from "@/lib/actions/customPackages";
import RepeatableRows from "@/components/admin/cms/RepeatableRows";
import CustomSelect from "@/components/CustomSelect";
import { dayOptions, nightOptions } from "@/lib/durationHelpers";
import { calculateGst, formatRupees } from "@/lib/gst";
import SuggestInput from "@/components/admin/SuggestInput";

const inputClass =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const shortInputClass = `${inputClass} max-w-sm`;
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-900";
const cardClass = "rounded-2xl border border-ink-100 bg-white p-6 shadow-sm";

export type Option = { value: string; label: string; freeText?: boolean };

export type CustomPackageDefaults = {
  id?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  leadId?: string;
  destinationName?: string;
  startDate?: string;
  endDate?: string;
  durationNights?: number;
  durationDays?: number;
  adults?: number;
  children?: number;
  infants?: number;
  childAges?: string[];
  rooms?: number;
  extraBeds?: number;
  extraMattresses?: number;
  roomCategory?: string;
  roomCategoryOther?: string;
  hotelCategory?: string;
  inclusions?: string[];
  customInclusions?: string[];
  vehicleName?: string;
  price?: number;
  notes?: string;
  days?: Record<string, string>[];
  stays?: Record<string, string>[];
};

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className={cardClass}>
      <h2 className="font-heading text-base font-bold text-ink-900">{title}</h2>
      {hint && <p className="mt-1 text-sm text-ink-500">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function CustomPackageForm({
  isNew,
  defaults,
  destinationSuggestions,
  hotelSuggestions,
  citySuggestions,
  vehicleSuggestions,
  inclusionOptions,
  roomCategories,
  hotelCategories,
  gstPercent,
}: {
  isNew: boolean;
  defaults?: CustomPackageDefaults;
  destinationSuggestions: string[];
  hotelSuggestions: string[];
  citySuggestions: string[];
  vehicleSuggestions: string[];
  inclusionOptions: Option[];
  roomCategories: Option[];
  hotelCategories: Option[];
  gstPercent: number;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    (prevState, formData) => saveCustomPackageAction(isNew, prevState, formData),
    undefined
  );

  const [nights, setNights] = useState(String(defaults?.durationNights ?? ""));
  const [days, setDays] = useState(String(defaults?.durationDays ?? ""));
  const [roomCategory, setRoomCategory] = useState(defaults?.roomCategory ?? "");
  const [hotelCategory, setHotelCategory] = useState(defaults?.hotelCategory ?? "");
  const [price, setPrice] = useState(String(defaults?.price ?? ""));

  const [inclusions, setInclusions] = useState<Set<string>>(new Set(defaults?.inclusions ?? []));
  const freeTextValues = inclusionOptions.filter((o) => o.freeText).map((o) => o.value);
  const showCustomBox = freeTextValues.some((v) => inclusions.has(v));

  // Mirrors what the server will compute and store, so staff see the tax and
  // the grand total before saving instead of typing GST in by hand.
  const gst = calculateGst(Number(price) || 0, gstPercent);

  const roomCategoryIsOther = roomCategories.find((c) => c.value === roomCategory)?.freeText ?? false;

  const toggleInclusion = (value: string) => {
    setInclusions((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const categoryOptions = (list: Option[]) => [{ value: "", label: "—" }, ...list];

  return (
    <form action={formAction} className="mt-6 space-y-6">
      {!isNew && <input type="hidden" name="id" value={defaults?.id ?? ""} />}
      {defaults?.leadId && <input type="hidden" name="leadId" value={defaults.leadId} />}

      <Section title="Customer" hint="Who this quotation is being prepared for.">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="customerName">Name</label>
            <input id="customerName" name="customerName" required defaultValue={defaults?.customerName} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="customerPhone">Phone</label>
            <input id="customerPhone" name="customerPhone" defaultValue={defaults?.customerPhone} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="customerEmail">Email</label>
            <input id="customerEmail" name="customerEmail" type="email" defaultValue={defaults?.customerEmail} className={inputClass} />
          </div>
        </div>
      </Section>

      <Section title="Trip">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="destinationName">Destination</label>
            {/* Suggestions, not a dropdown: quotations are regularly raised
                for places that aren't CMS destinations yet, so past entries
                are offered without becoming a restriction. */}
            <SuggestInput
              id="destinationName"
              name="destinationName"
              required
              suggestions={destinationSuggestions}
              defaultValue={defaults?.destinationName}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="startDate">Travel start date</label>
            <input id="startDate" name="startDate" type="date" defaultValue={defaults?.startDate} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="endDate">Travel end date</label>
            <input id="endDate" name="endDate" type="date" defaultValue={defaults?.endDate} className={inputClass} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="durationNights">Nights</label>
            <CustomSelect name="durationNights" required value={nights} onChange={setNights} placeholder="Select nights" options={nightOptions} />
          </div>
          <div>
            <label className={labelClass} htmlFor="durationDays">Days</label>
            <CustomSelect name="durationDays" required value={days} onChange={setDays} placeholder="Select days" options={dayOptions} />
          </div>
          <div>
            <label className={labelClass} htmlFor="vehicleName">Vehicle name</label>
            <SuggestInput
              id="vehicleName"
              name="vehicleName"
              suggestions={vehicleSuggestions}
              placeholder="Innova Crysta"
              defaultValue={defaults?.vehicleName}
              className={inputClass}
            />
          </div>
        </div>
      </Section>

      <Section title="Travellers & rooms">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
          <div>
            <label className={labelClass} htmlFor="adults">Adults</label>
            <input id="adults" name="adults" type="number" min={0} defaultValue={defaults?.adults ?? 1} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="children">Children</label>
            <input id="children" name="children" type="number" min={0} defaultValue={defaults?.children ?? 0} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="infants">Infants</label>
            <input id="infants" name="infants" type="number" min={0} defaultValue={defaults?.infants ?? 0} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="rooms">Rooms</label>
            <input id="rooms" name="rooms" type="number" min={0} defaultValue={defaults?.rooms ?? 1} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="extraBeds">Extra beds</label>
            <input id="extraBeds" name="extraBeds" type="number" min={0} defaultValue={defaults?.extraBeds ?? 0} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="extraMattresses">Extra mattresses</label>
            <input id="extraMattresses" name="extraMattresses" type="number" min={0} defaultValue={defaults?.extraMattresses ?? 0} className={inputClass} />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="childAges">Child / infant ages (one per line)</label>
            <textarea id="childAges" name="childAges" rows={3} defaultValue={defaults?.childAges?.join("\n")} placeholder={"6\n18 months"} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="hotelCategory">Hotel category</label>
            <CustomSelect name="hotelCategory" value={hotelCategory} onChange={setHotelCategory} placeholder="—" options={categoryOptions(hotelCategories)} />
          </div>
          <div>
            <label className={labelClass} htmlFor="roomCategory">Room category</label>
            <CustomSelect name="roomCategory" value={roomCategory} onChange={setRoomCategory} placeholder="—" options={categoryOptions(roomCategories)} />
            {roomCategoryIsOther && (
              <input
                name="roomCategoryOther"
                defaultValue={defaults?.roomCategoryOther}
                placeholder="Specify the room category"
                className={`${inputClass} mt-2`}
              />
            )}
            {!roomCategoryIsOther && <input type="hidden" name="roomCategoryOther" value="" />}
          </div>
        </div>
      </Section>

      <Section
        title="Accommodation"
        hint="One block per hotel. A multi-city trip gets a row for each city, in order of travel."
      >
        <RepeatableRows
          name="stays"
          addLabel="Add hotel"
          initialRows={defaults?.stays ?? []}
          fields={[
            { key: "city", label: "City", type: "suggest", suggestions: citySuggestions },
            { key: "nights", label: "Nights", type: "number" },
            { key: "hotelName", label: "Hotel Name", type: "suggest", suggestions: hotelSuggestions },
            { key: "hotelCategory", label: "Hotel Category", type: "options", options: hotelCategories },
            { key: "roomCategory", label: "Room Category", type: "options", options: roomCategories },
            { key: "rooms", label: "Rooms", type: "number" },
            { key: "extraBed", label: "Extra Bed", type: "checkbox" },
            { key: "extraMattress", label: "Extra Mattress", type: "checkbox" },
          ]}
        />
      </Section>

      <Section title="Itinerary" hint="Each day carries its own date, title and description.">
        <RepeatableRows
          name="days"
          addLabel="Add Day"
          stacked
          initialRows={defaults?.days ?? []}
          fields={[
            { key: "date", label: "Date", type: "date" },
            { key: "title", label: "Day Title", type: "text" },
            { key: "desc", label: "Description", type: "textarea" },
          ]}
        />
      </Section>

      <Section title="Inclusions">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {inclusionOptions.map((opt) => (
            <label key={opt.value} className="flex items-start gap-2 text-sm text-ink-900">
              <input
                type="checkbox"
                name="inclusions"
                value={opt.value}
                checked={inclusions.has(opt.value)}
                onChange={() => toggleInclusion(opt.value)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink-300 accent-brand-600"
              />
              {opt.label}
            </label>
          ))}
        </div>
        {showCustomBox ? (
          <div className="mt-4">
            <label className={labelClass} htmlFor="customInclusions">Other inclusions (one per line)</label>
            <textarea id="customInclusions" name="customInclusions" rows={3} defaultValue={defaults?.customInclusions?.join("\n")} className={inputClass} />
          </div>
        ) : (
          <input type="hidden" name="customInclusions" value="" />
        )}
      </Section>

      <Section title="Pricing">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="price">Package price (₹)</label>
            <input
              id="price"
              name="price"
              type="number"
              min={0}
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={shortInputClass}
            />
          </div>
          <div className="rounded-xl border border-ink-200 bg-ink-50/60 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-700">
              GST ({gstPercent}%) — calculated automatically
            </p>
            <dl className="mt-2 space-y-1 text-sm text-ink-800">
              <div className="flex justify-between">
                <dt>Package price</dt>
                <dd>{formatRupees(gst.price)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>GST</dt>
                <dd>{formatRupees(gst.gstAmount)}</dd>
              </div>
              <div className="flex justify-between border-t border-ink-200 pt-1 font-bold text-ink-900">
                <dt>Total</dt>
                <dd>{formatRupees(gst.totalAmount)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-ink-500">
              The rate comes from Settings, and is saved onto this quotation so reprints never change.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <label className={labelClass} htmlFor="notes">Internal notes (not printed)</label>
          <textarea id="notes" name="notes" rows={3} defaultValue={defaults?.notes} className={inputClass} />
        </div>
      </Section>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Saving..." : isNew ? "Create & Generate PDF" : "Save Changes"}
      </button>
    </form>
  );
}
