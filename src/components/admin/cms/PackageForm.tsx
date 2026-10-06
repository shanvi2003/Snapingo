"use client";

import { useActionState, useState } from "react";
import ContentBlocksEditor, { type EditableContentBlock } from "@/components/admin/ContentBlocksEditor";
import FormSection from "@/components/admin/FormSection";
import { savePackageAction, type FormState } from "@/lib/actions/cms";
import ImageUrlField from "@/components/admin/cms/ImageUrlField";
import RepeatableRows from "@/components/admin/cms/RepeatableRows";
import { packageCategoryOptions } from "@/lib/packageCategoryHelpers";
import { dayOptions, nightOptions } from "@/lib/durationHelpers";
import { calculateGst, formatRupees } from "@/lib/gst";
import CustomSelect from "@/components/CustomSelect";
import SuggestInput from "@/components/admin/SuggestInput";

const inputClass =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-900";

const Section = FormSection;

export type PackageOption = { value: string; label: string; freeText?: boolean };
export type DestinationOption = { value: string; label: string; type: string };

export type PackageDefaults = {
  id?: string;
  code?: string | null;
  title?: string;
  destinationSlug?: string;
  type?: string;
  image?: string;
  durationNights?: number | null;
  durationDays?: number | null;
  price?: number;
  originalPrice?: number;
  rating?: number;
  reviews?: number;
  tripsSold?: number;
  badge?: string;
  featured?: boolean;
  hotDeal?: boolean;
  inclusions?: string[];
  customInclusions?: string[];
  exclusions?: string[];
  categories?: string[];
  highlights?: string[];
  itinerary?: { title: string; desc: string }[];
};

export default function PackageForm({
  isNew,
  defaults,
  destinations,
  badges,
  inclusionOptions,
  contentBlocks,
  standardContentBlocks,
  gstPercent,
  titleSuggestions,
  nextPackageCode,
}: {
  isNew: boolean;
  defaults?: PackageDefaults;
  destinations: DestinationOption[];
  badges: PackageOption[];
  inclusionOptions: PackageOption[];
  // This package's PDF sections (its own copy, or the standard content).
  contentBlocks: EditableContentBlock[];
  standardContentBlocks: EditableContentBlock[];
  gstPercent: number;
  titleSuggestions: string[];
  // What the next package's code will be. Preview only - the code is actually
  // issued server-side when the package is created.
  nextPackageCode: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    (prevState, formData) => savePackageAction(isNew, prevState, formData),
    undefined
  );

  const [title, setTitle] = useState(defaults?.title ?? "");
  const [type, setType] = useState(defaults?.type ?? "domestic");
  const [destinationSlug, setDestinationSlug] = useState(defaults?.destinationSlug ?? "");
  const [badge, setBadge] = useState(defaults?.badge ?? "");
  const [price, setPrice] = useState(defaults?.price != null ? String(defaults.price) : "");
  const [nights, setNights] = useState(
    defaults?.durationNights != null ? String(defaults.durationNights) : ""
  );
  const [days, setDays] = useState(defaults?.durationDays != null ? String(defaults.durationDays) : "");
  const [promotion, setPromotion] = useState<"featured" | "hotDeal" | "">(
    defaults?.featured ? "featured" : defaults?.hotDeal ? "hotDeal" : ""
  );

  // Ticked inclusions live in React state (not the DOM) so the derived
  // exclusions below can update live as staff tick boxes.
  const [inclusions, setInclusions] = useState<Set<string>>(new Set(defaults?.inclusions ?? []));

  const toggleInclusion = (value: string) => {
    setInclusions((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  // Only the destinations that match the chosen type - a domestic package can
  // only go to a domestic destination, so offering all of them just invites a
  // mismatch the form would then have to reject.
  const destinationsForType = destinations.filter((d) => d.type === type);

  // GST is never a field staff type: it is derived from the price at the rate
  // configured in settings, and shown live so the tax-inclusive figure is
  // visible while pricing rather than worked out on a calculator.
  const gst = calculateGst(Number(price) || 0, gstPercent);

  // Everything the staff member did NOT tick is what the customer will see
  // under Exclusions - shown live so that rule is visible rather than a
  // surprise on the generated PDF.
  const derivedExclusions = inclusionOptions
    .filter((o) => !o.freeText && !inclusions.has(o.value))
    .map((o) => o.label);

  return (
    <form action={formAction} className="mt-6 w-full space-y-6">
      {/* Edits post the existing id straight back: it's the package's public
          URL, so it is never regenerated from a retitled package. New
          packages post nothing and the server derives the id from the title. */}
      {!isNew && <input type="hidden" name="id" value={defaults?.id ?? ""} />}

      <Section title="Basic details">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <p className={labelClass}>Package ID</p>
            <p className="rounded-xl border border-dashed border-ink-200 bg-ink-50 px-4 py-2.5 font-mono text-sm text-ink-700">
              {isNew ? nextPackageCode : (defaults?.code ?? "—")}
            </p>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass} htmlFor="title">Title</label>
            <SuggestInput
              id="title"
              name="title"
              required
              suggestions={titleSuggestions}
              value={title}
              onChange={setTitle}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="type">Type</label>
            <CustomSelect
              name="type"
              value={type}
              onChange={(next) => {
                setType(next);
                // A destination picked under the other type would no longer be
                // in the list, leaving the field showing a value the dropdown
                // can't display - so switching type clears it.
                setDestinationSlug("");
              }}
              options={[
                { value: "domestic", label: "Domestic" },
                { value: "international", label: "International" },
              ]}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="destinationSlug">Destination</label>
            <CustomSelect
              name="destinationSlug"
              required
              value={destinationSlug}
              onChange={setDestinationSlug}
              placeholder={
                destinationsForType.length > 0
                  ? "Select a destination"
                  : `No ${type} destinations yet`
              }
              options={destinationsForType}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="badge">Badge (optional)</label>
            <CustomSelect
              name="badge"
              value={badge}
              onChange={setBadge}
              placeholder="No badge"
              options={[{ value: "", label: "No badge" }, ...badges]}
            />
          </div>
        </div>

        <div className="mt-5">
          <ImageUrlField name="image" label="Cover Image URL" defaultValue={defaults?.image} required />
        </div>
      </Section>

      <Section title="Duration">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="durationNights">Nights</label>
            <CustomSelect
              name="durationNights"
              required
              value={nights}
              onChange={setNights}
              placeholder="Select nights"
              options={nightOptions}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="durationDays">Days</label>
            <CustomSelect
              name="durationDays"
              required
              value={days}
              onChange={setDays}
              placeholder="Select days"
              options={dayOptions}
            />
          </div>
        </div>
      </Section>

      <Section title="Pricing">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="price">Price (₹)</label>
            <input
              id="price"
              name="price"
              type="number"
              min={0}
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="originalPrice">Original Price (₹)</label>
            <input id="originalPrice" name="originalPrice" type="number" min={0} required defaultValue={defaults?.originalPrice} className={inputClass} />
          </div>

          {/* GST is never a field staff type: it is derived from the price at
              the rate configured in settings, and shown live beside the price
              so the tax-inclusive figure is visible while pricing. */}
          <div className="rounded-xl border border-ink-200 bg-ink-50/60 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-700">
              GST ({gstPercent}%) — calculated automatically
            </p>
            <dl className="mt-2 space-y-1 text-sm text-ink-800">
              <div className="flex justify-between">
                <dt>Price</dt>
                <dd>{formatRupees(gst.price)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>GST</dt>
                <dd>{formatRupees(gst.gstAmount)}</dd>
              </div>
              <div className="flex justify-between border-t border-ink-200 pt-1 font-bold text-ink-900">
                <dt>Price incl. GST</dt>
                <dd>{formatRupees(gst.totalAmount)}</dd>
              </div>
            </dl>
          </div>
        </div>
      </Section>

      <Section title="Ratings">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="rating">Rating</label>
            <input id="rating" name="rating" type="number" step="0.1" min={0} max={5} required defaultValue={defaults?.rating} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="reviews">Reviews Count</label>
            <input id="reviews" name="reviews" type="number" min={0} required defaultValue={defaults?.reviews} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="tripsSold">Number of trips sold</label>
            <input id="tripsSold" name="tripsSold" type="number" min={0} defaultValue={defaults?.tripsSold ?? 0} className={inputClass} />
          </div>
        </div>
      </Section>

      <Section title="Promotion & categories">
        <p className={labelClass}>Promotion</p>
        {/* Mutually exclusive, like radios: a package is promoted in one place
            or the other, never both. Clicking the selected one again clears
            it, since "neither" is also a valid answer - which is exactly what
            a real radio group can't express without a third option. */}
        <div className="flex flex-wrap gap-3">
          {(
            [
              { value: "featured", label: "Featured" },
              { value: "hotDeal", label: "Hot Deal" },
            ] as const
          ).map((option) => {
            const active = promotion === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => setPromotion(active ? "" : option.value)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "border-brand-600 bg-brand-600 text-white"
                    : "border-ink-200 text-ink-700 hover:border-brand-400 hover:text-brand-600"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        {/* The columns stay booleans in the database, so exactly one of these
            is submitted and the other is simply absent - which the schema
            already reads as false. */}
        {promotion === "featured" && <input type="hidden" name="featured" value="on" />}
        {promotion === "hotDeal" && <input type="hidden" name="hotDeal" value="on" />}

        <p className={`${labelClass} mt-6`}>Categories</p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2.5 sm:grid-cols-4">
          {packageCategoryOptions.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 text-sm text-ink-900">
              <input
                type="checkbox"
                name="categories"
                value={opt.value}
                defaultChecked={defaults?.categories?.includes(opt.value)}
                className="h-4 w-4 rounded border-ink-300 accent-brand-600"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </Section>

      <Section title="Inclusions">
        {/* Two columns, not three: at three the longest option ("Pickup and
            Drop (Airport / Railway Station / Bus Stand)") wraps onto a second
            line and breaks the rhythm of the list. */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2">
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

        {/* Always visible, not revealed by ticking "Other (Specify)": staff
            shouldn't have to discover a checkbox to find the box they need. */}
        <div className="mt-6">
          <label className={labelClass} htmlFor="customInclusions">
            Other inclusions (one per line)
          </label>
          <textarea
            id="customInclusions"
            name="customInclusions"
            rows={3}
            defaultValue={defaults?.customInclusions?.join("\n")}
            placeholder={"Airport lounge access\nProfessional photoshoot"}
            className={inputClass}
          />
        </div>
      </Section>

      <Section title="Exclusions">
        {/* Everything the staff member did NOT tick is what the customer will
            see under Exclusions - shown live so that rule is visible rather
            than a surprise on the generated PDF. */}
        <p className={labelClass}>Added automatically (not ticked under Inclusions)</p>
        <p className="text-sm leading-relaxed text-ink-700">
          {derivedExclusions.length > 0
            ? derivedExclusions.join(", ")
            : "None - every inclusion is ticked."}
        </p>

        <div className="mt-6">
          <label className={labelClass} htmlFor="exclusions">
            Additional exclusions (one per line)
          </label>
          <textarea
            id="exclusions"
            name="exclusions"
            rows={3}
            defaultValue={defaults?.exclusions?.join("\n")}
            placeholder={"GST and government taxes\nPersonal expenses, tips & shopping\nTravel insurance"}
            className={inputClass}
          />
        </div>
      </Section>

      <Section title="Highlights">
        <label className={labelClass} htmlFor="highlights">One per line</label>
        <textarea id="highlights" name="highlights" rows={4} defaultValue={defaults?.highlights?.join("\n")} className={inputClass} />
      </Section>

      <Section title="Itinerary">
        <RepeatableRows
          name="itinerary"
          addLabel="Add Day"
          // stacked: the client asked for the Day Title on its own row with
          // the Description on the row below, instead of the two sitting
          // side by side.
          stacked
          fields={[
            { key: "title", label: "Day Title", type: "text" },
            { key: "desc", label: "Description", type: "textarea" },
          ]}
          initialRows={defaults?.itinerary ?? []}
        />
      </Section>

      <Section title="Standard Content">
        <ContentBlocksEditor initial={contentBlocks} standard={standardContentBlocks} />
      </Section>

      {state?.error && <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Saving..." : isNew ? "Create Package" : "Save Changes"}
      </button>
    </form>
  );
}
