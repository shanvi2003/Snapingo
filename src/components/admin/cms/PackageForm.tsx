"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Lock, SquarePen } from "lucide-react";
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
// Single-value fields (a title, a price, a star rating...) never need to be
// wider than this to show their whole value - letting them stretch to fill
// a wide grid column on a big screen just leaves the input looking
// stranded in a mostly-empty cell. Multi-line fields (highlights, the
// itinerary, image URLs) keep the plain w-full `inputClass` instead, since
// those genuinely benefit from the extra width.
const shortInputClass = `${inputClass} max-w-sm`;
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-900";
// Sections need to outrank field labels visually - at the same size as a
// label, "Itinerary" read as just another caption. Larger, sentence case and
// underlined, matching the card headings on the quotation form.
const sectionClass =
  "mb-3 block border-b border-ink-100 pb-2 font-heading text-base font-bold text-ink-900";

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

// The policy copy printed on every itinerary PDF. Shown here read-only, as
// the client asked, so staff can see what the customer will receive without
// being able to edit it by accident. The Edit button leads to the page where
// it *is* editable - a separate page rather than an inline textarea because
// these blocks are shared by every package, and editing them from inside one
// package's form would make a global change look like a local one.
function LockedContentSections({
  blocks,
  editHref,
  canEdit,
}: {
  blocks: { key: string; title: string; body: string }[];
  editHref: string;
  canEdit: boolean;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 font-heading text-base font-bold text-ink-900">
          <Lock className="h-4 w-4 text-ink-400" />
          Standard content on every itinerary PDF
        </p>
        {canEdit && (
          <Link
            href={editHref}
            target="_blank"
            className="flex items-center gap-1.5 rounded-full border border-ink-200 px-3 py-1.5 text-xs font-semibold text-ink-700 transition hover:border-brand-400 hover:text-brand-600"
          >
            <SquarePen className="h-3.5 w-3.5" />
            Edit
          </Link>
        )}
      </div>
      <p className="mt-1 text-xs text-ink-500">
        Filled in automatically and shared across all packages. {canEdit ? "Use Edit to change it for every package at once." : "Ask an admin to change it."}
      </p>
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {blocks.map((block) => (
          <div key={block.key} className="rounded-xl border border-ink-200 bg-ink-50/60 p-3">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-700">{block.title}</p>
            <p className="mt-1 line-clamp-4 whitespace-pre-line text-xs leading-relaxed text-ink-500">
              {block.body || "Not set yet."}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PackageForm({
  isNew,
  defaults,
  destinations,
  badges,
  inclusionOptions,
  contentBlocks,
  contentEditHref,
  canEditContent,
  gstPercent,
  titleSuggestions,
  nextPackageCode,
}: {
  isNew: boolean;
  defaults?: PackageDefaults;
  destinations: DestinationOption[];
  badges: PackageOption[];
  inclusionOptions: PackageOption[];
  contentBlocks: { key: string; title: string; body: string }[];
  contentEditHref: string;
  canEditContent: boolean;
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
    <form action={formAction} className="mt-6 w-full space-y-6 rounded-2xl border border-ink-100 bg-white p-6 shadow-sm">
      {/* Edits post the existing id straight back: it's the package's public
          URL, so it is never regenerated from a retitled package. New
          packages post nothing and the server derives the id from the title. */}
      {!isNew && <input type="hidden" name="id" value={defaults?.id ?? ""} />}

      {/* Rows are capped at max-w-3xl so the two columns sit next to each
          other instead of being flung to opposite edges of a wide screen,
          which is what made the first rows look so gappy. */}
      <div className="grid max-w-3xl grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
        <div>
          <p className={labelClass}>Package ID</p>
          <p className="rounded-xl border border-dashed border-ink-200 bg-ink-50 px-4 py-2.5 font-mono text-sm text-ink-700">
            {isNew ? nextPackageCode : (defaults?.code ?? "—")}
          </p>
        </div>
        <div>
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
      </div>

      <div className="max-w-xl">
        <ImageUrlField name="image" label="Cover Image URL" defaultValue={defaults?.image} required />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="max-w-sm">
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
        <div className="max-w-sm">
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
        <div className="max-w-sm">
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-5">
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
            className={shortInputClass}
          />
        </div>
        <div>
          <label className={labelClass} htmlFor="originalPrice">Original Price (₹)</label>
          <input id="originalPrice" name="originalPrice" type="number" min={0} required defaultValue={defaults?.originalPrice} className={shortInputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="rating">Rating</label>
          <input id="rating" name="rating" type="number" step="0.1" min={0} max={5} required defaultValue={defaults?.rating} className={shortInputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="reviews">Reviews Count</label>
          <input id="reviews" name="reviews" type="number" min={0} required defaultValue={defaults?.reviews} className={shortInputClass} />
        </div>
        <div>
          <label className={labelClass} htmlFor="tripsSold">Number of trips sold</label>
          <input id="tripsSold" name="tripsSold" type="number" min={0} defaultValue={defaults?.tripsSold ?? 0} className={shortInputClass} />
        </div>
      </div>

      <div className="max-w-md rounded-xl border border-ink-200 bg-ink-50/60 p-4">
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

      <div>
        <p className={sectionClass}>Promotion</p>
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
      </div>

      <div>
        <p className={sectionClass}>Inclusions</p>
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
        <div className="mt-4 max-w-xl">
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
      </div>

      <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4">
        <p className="mb-2 border-b border-rose-200 pb-2 font-heading text-base font-bold text-rose-700">Exclusions</p>
        <p className="mt-1 text-xs text-rose-700/80">
          Everything left unticked above is shown to the customer automatically. Add anything else
          below.
        </p>
        <p className="mt-2 text-sm text-ink-700">
          {derivedExclusions.length > 0
            ? derivedExclusions.join(" · ")
            : "Nothing excluded automatically - every inclusion is ticked."}
        </p>

        <div className="mt-4 max-w-xl">
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
      </div>

      <div>
        <p className={sectionClass}>Categories</p>
        <div className="flex flex-wrap gap-4">
          {packageCategoryOptions.map((opt) => (
            <label key={opt.value} className="flex items-center gap-1.5 text-sm text-ink-900">
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
      </div>

      <div>
        <label className={labelClass} htmlFor="highlights">Highlights (one per line)</label>
        <textarea id="highlights" name="highlights" rows={4} defaultValue={defaults?.highlights?.join("\n")} className={inputClass} />
      </div>

      <div>
        <p className={sectionClass}>Itinerary</p>
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
      </div>

      <LockedContentSections blocks={contentBlocks} editHref={contentEditHref} canEdit={canEditContent} />

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
