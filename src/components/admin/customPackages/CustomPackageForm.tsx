"use client";

import {
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import { saveCustomPackageAction, type FormState } from "@/lib/actions/customPackages";
import RepeatableRows from "@/components/admin/cms/RepeatableRows";
import CustomSelect from "@/components/CustomSelect";
import { dayOptions, MAX_DURATION_NIGHTS, nightOptions } from "@/lib/durationHelpers";
import { formatRupees } from "@/lib/gst";
import SuggestInput from "@/components/admin/SuggestInput";
import ItineraryDays, { datesFromStart, type DayRow } from "@/components/admin/customPackages/ItineraryDays";
import ContentBlocksEditor, { type EditableContentBlock } from "@/components/admin/ContentBlocksEditor";
import FormSection from "@/components/admin/FormSection";
import { CHILD_AGES, INFANT_AGES, splitTravellerAges } from "@/lib/travellerAges";
import CopyFromQuotation from "@/components/admin/customPackages/CopyFromQuotation";
import { Plus, Trash2 } from "lucide-react";
import {
  MAX_PRICE_LINES,
  parsePriceLines,
  priceLineAmountWithGst,
  priceLinesGst,
  rateWithGst,
} from "@/lib/priceLines";

// Lets the copy search (outside the form) read what's been typed so far.
const FORM_ID = "custom-package-form";

const inputClass =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-900";
// Shared by the price table's header and rows so the columns line up.
const PRICE_ROW_GRID = "grid grid-cols-[minmax(0,1fr)_96px_150px_120px_32px] items-center gap-3";

export type Option = { value: string; label: string; freeText?: boolean };

// Up to 20 age dropdowns each for children and infants; the server accepts
// 40 ages in all (customPackageSchema.childAges).
const MAX_AGE_ROWS = 20;

// Ages prefilled from a lead can be free text ("18 months"); keep such a
// value selectable so editing doesn't silently blank the age.
const ageOptionsFor = (ages: string[], current: string | undefined): Option[] => {
  const options = ages.map((a) => ({ value: a, label: a }));
  return current && !ages.includes(current) ? [{ value: current, label: current }, ...options] : options;
};

const countOf = (value: string) => Math.min(MAX_AGE_ROWS, Math.max(0, Math.floor(Number(value) || 0)));

// The price breakup starts with one row per kind of traveller, its count
// following the Travellers section. A row keeps that link (`kind`) while it
// exists, even renamed ("Child" -> "Child with bed"); rows staff add are free.
const travellerRowLabels = { adult: "Adult", child: "Child", infant: "Infant" } as const;
type TravellerKind = keyof typeof travellerRowLabels;
// `custom`: staff picked "Other" and type the name themselves.
type PriceRow = { kind?: TravellerKind; custom?: boolean; label: string; count: string; rate: string };

const kindOfLabel = (label: string) =>
  (Object.keys(travellerRowLabels) as TravellerKind[]).find((k) => travellerRowLabels[k] === label);

// The usual ways a quote is split per person; "Other" covers the rest.
const travellerTypes = ["Adult", "Extra adult", "Child", "Child with bed", "Child without bed", "Infant"];
const OTHER_TYPE = "__other__";
const travellerTypeOptions = [
  ...travellerTypes.map((t) => ({ value: t, label: t })),
  { value: OTHER_TYPE, label: "Other" },
];
const isCustomType = (label: string) => Boolean(label) && !travellerTypes.includes(label);

export type CustomPackageDefaults = {
  id?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  leadId?: string;
  tripType?: string;
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
  exclusions?: string[];
  vehicleName?: string;
  // Per-person breakup; numbers from a saved quotation, strings from a draft.
  priceLines?: { label: string; count: number | string; rate: number | string }[];
  showTravellerCount?: boolean;
  // A quotation saved before the breakup existed: its old total, shown as a
  // reminder while its per-person rates are entered.
  price?: number;
  notes?: string;
  // Who prepared it (printed under the operation head on the PDF).
  preparedByName?: string;
  preparedByRole?: string;
  days?: Record<string, string>[];
  stays?: Record<string, string>[];
  // This quotation's own PDF sections; absent = start from the standard ones.
  contentBlocks?: EditableContentBlock[];
};

const Section = FormSection;

type FormProps = {
  // The page heading, shown beside the copy search.
  header?: React.ReactNode;
  isNew: boolean;
  // Opened as a lead's Edit screen: after saving, go back to that lead.
  returnToLead?: boolean;
  defaults?: CustomPackageDefaults;
  destinationSuggestions: string[];
  hotelSuggestions: string[];
  citySuggestions: string[];
  vehicleSuggestions: string[];
  inclusionOptions: Option[];
  roomCategories: Option[];
  hotelCategories: Option[];
  gstPercent: number;
  // The standard PDF sections: the starting copy, and what "Reset" restores.
  standardContentBlocks: EditableContentBlock[];
};

type Draft = { savedAt: number; values: CustomPackageDefaults };

const noopSubscribe = () => () => {};

function readDraft(key: string): Draft | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    // Storage blocked or a corrupt entry - just start from the defaults.
    return null;
  }
}

/**
 * Reads the whole form back into the same shape the server page passes in as
 * `defaults`, so a saved draft can be fed straight back in as the starting
 * values - every field already knows how to start from `defaults`.
 */
function formToDefaults(form: HTMLFormElement): CustomPackageDefaults {
  const fd = new FormData(form);
  const str = (key: string) => {
    const v = fd.get(key);
    return typeof v === "string" ? v : undefined;
  };
  const num = (key: string) => {
    const v = str(key);
    return v === undefined || v === "" ? undefined : Number(v);
  };
  const rows = (key: string): Record<string, string>[] => {
    try {
      const parsed = JSON.parse(str(key) ?? "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  return {
    id: str("id"),
    leadId: str("leadId"),
    customerName: str("customerName"),
    customerPhone: str("customerPhone"),
    customerEmail: str("customerEmail"),
    tripType: str("tripType"),
    destinationName: str("destinationName"),
    startDate: str("startDate"),
    endDate: str("endDate"),
    durationNights: num("durationNights"),
    durationDays: num("durationDays"),
    vehicleName: str("vehicleName"),
    adults: num("adults"),
    children: num("children"),
    infants: num("infants"),
    // Not filtered: positions line up with the child then infant dropdowns,
    // blanks included.
    childAges: (str("childAges") ?? "").split("\n"),
    rooms: num("rooms"),
    extraBeds: num("extraBeds"),
    extraMattresses: num("extraMattresses"),
    hotelCategory: str("hotelCategory"),
    roomCategory: str("roomCategory"),
    roomCategoryOther: str("roomCategoryOther"),
    stays: rows("stays"),
    days: rows("days"),
    inclusions: fd.getAll("inclusions").filter((v): v is string => typeof v === "string"),
    customInclusions: (str("customInclusions") ?? "").split("\n").filter(Boolean),
    exclusions: (str("exclusions") ?? "").split("\n").filter(Boolean),
    priceLines: rows("priceLines") as CustomPackageDefaults["priceLines"],
    notes: str("notes"),
    preparedByName: str("preparedByName"),
    preparedByRole: str("preparedByRole"),
    contentBlocks: rows("contentBlocks") as EditableContentBlock[],
  };
}

/**
 * Keeps an in-progress quotation in this browser until it's saved, so leaving
 * the page halfway (or a failed save) never costs the staff member what they
 * typed. Per quotation: new ones, new ones raised from a lead, and each edit
 * have separate drafts. Browser-only on purpose - nothing reaches the server
 * until "Create" / "Save" is pressed.
 */
export default function CustomPackageForm(props: FormProps) {
  const leadSuffix = props.defaults?.leadId ? `:lead-${props.defaults.leadId}` : "";
  const draftKey = `snapingo:custom-package-draft:${props.isNew ? `new${leadSuffix}` : props.defaults?.id}`;

  // False on the server and during hydration, true right after: the server
  // has no localStorage, so a draft can only be applied once in the browser
  // without the two renders disagreeing.
  const inBrowser = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
  const [discarded, setDiscarded] = useState(false);

  // Read once per page visit - the form keeps rewriting this key while
  // editing, and re-reading it would remount the form on every keystroke.
  const draft = useMemo(
    () => (inBrowser && !discarded ? readDraft(draftKey) : null),
    [inBrowser, discarded, draftKey]
  );

  // A package copied from another quotation (see CopyFromQuotation).
  const [copy, setCopy] = useState<{ at: number; values: CustomPackageDefaults } | null>(null);

  const discardDraft = () => {
    try {
      localStorage.removeItem(draftKey);
    } catch {}
    setDiscarded(true);
    setCopy(null);
  };

  const baseDefaults = draft ? { ...props.defaults, ...draft.values } : props.defaults;

  // The copied trip replaces the form's contents, but who it's for stays:
  // the customer's details (as typed so far), the notes, and which lead and
  // quotation this is.
  const copyIn = (values: CustomPackageDefaults) => {
    const form = document.getElementById(FORM_ID);
    const current = form instanceof HTMLFormElement ? formToDefaults(form) : {};
    setCopy({
      at: Date.now(),
      values: {
        ...values,
        id: props.defaults?.id,
        leadId: props.defaults?.leadId,
        customerName: current.customerName,
        customerPhone: current.customerPhone,
        customerEmail: current.customerEmail,
        notes: current.notes,
        // Whoever is preparing this one, not whoever prepared the original.
        preparedByName: current.preparedByName,
        preparedByRole: current.preparedByRole,
      },
    });
  };

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>{props.header}</div>
        <CopyFromQuotation excludeId={props.defaults?.id} onCopy={copyIn} />
      </div>
      <CustomPackageFormBody
        // Remounting is what makes every field (controlled or not) pick the
        // draft, or a copied package, up as its starting value.
        key={copy ? `copy-${copy.at}` : draft ? `draft-${draft.savedAt}` : "base"}
        {...props}
        defaults={copy ? { ...baseDefaults, ...copy.values } : baseDefaults}
        draftKey={draftKey}
        restoredAt={copy ? undefined : draft?.savedAt}
        // A copied package is unsaved work worth keeping as a draft.
        startDirty={Boolean(copy)}
        onDiscardDraft={discardDraft}
      />
    </>
  );
}

function CustomPackageFormBody({
  isNew,
  returnToLead = false,
  defaults,
  destinationSuggestions,
  hotelSuggestions,
  citySuggestions,
  vehicleSuggestions,
  inclusionOptions,
  roomCategories,
  hotelCategories,
  gstPercent,
  standardContentBlocks,
  draftKey,
  restoredAt,
  startDirty = false,
  onDiscardDraft,
}: FormProps & { draftKey: string; restoredAt?: number; startDirty?: boolean; onDiscardDraft: () => void }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<FormState, FormData>(async (prevState, formData) => {
    try {
      return await saveCustomPackageAction(isNew, prevState, formData);
    } catch (error) {
      // An unexpected server failure shows as a message here instead of
      // replacing the page, so nothing typed is lost and it can be retried.
      console.error(error);
      return { error: "Couldn't save the quotation. Your entries are still here - please try again." };
    }
  }, undefined);

  const saved = Boolean(state && "savedPath" in state);

  const formRef = useRef<HTMLFormElement>(null);
  // Only a form someone has actually touched is worth keeping as a draft;
  // otherwise just opening the page would leave one behind.
  const dirty = useRef(startDirty);
  // Between pressing Save and hearing back, nothing is written - a successful
  // save redirects away, and must not leave the draft it just cleared behind.
  const submitting = useRef(false);

  const saveDraft = useCallback(() => {
    if (!dirty.current || submitting.current || !formRef.current) return;
    try {
      const draft: Draft = { savedAt: Date.now(), values: formToDefaults(formRef.current) };
      localStorage.setItem(draftKey, JSON.stringify(draft));
    } catch {
      // Storage full or blocked: the form still works, it just isn't kept.
    }
  }, [draftKey]);

  const markDirty = () => {
    dirty.current = true;
    saveDraft();
  };

  // Saved: only now is the draft dropped, then on to the quotation. Failed:
  // the typed values stay on screen (see onSubmit) and keep being drafted.
  useEffect(() => {
    if (!state) return;
    if ("savedPath" in state) {
      try {
        localStorage.removeItem(draftKey);
      } catch {}
      router.push(state.savedPath);
      return;
    }
    submitting.current = false;
    saveDraft();
  }, [state, saveDraft, draftKey, router]);

  // After every render, so changes held in React state (dropdowns, itinerary
  // rows, dates) are captured as well as plain typing.
  useEffect(() => {
    saveDraft();
  });

  // Submitting through onSubmit instead of <form action>: React resets a form
  // after an `action` completes, which wiped every field whenever the server
  // sent back an error like "Add at least one day to the itinerary."
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    submitting.current = true;
    startTransition(() => formAction(formData));
  };

  const [tripType, setTripType] = useState(defaults?.tripType ?? "domestic");
  const [adults, setAdults] = useState(String(defaults?.adults ?? 1));
  const [children, setChildren] = useState(String(defaults?.children ?? 0));
  const [infants, setInfants] = useState(String(defaults?.infants ?? 0));

  const [priceRows, setPriceRows] = useState<PriceRow[]>(() => {
    const saved = defaults?.priceLines ?? [];
    if (saved.length > 0) {
      return saved.map((l) => ({
        kind: kindOfLabel(l.label),
        custom: isCustomType(l.label),
        label: l.label,
        count: String(l.count),
        rate: String(l.rate),
      }));
    }
    const counts = { adult: defaults?.adults ?? 1, child: defaults?.children ?? 0, infant: defaults?.infants ?? 0 };
    return (Object.keys(counts) as TravellerKind[])
      .filter((k) => k === "adult" || counts[k] > 0)
      .map((k) => ({ kind: k, label: travellerRowLabels[k], count: String(counts[k]), rate: "" }));
  });
  // A change under Travellers carries into its price row, adding the row the
  // first time, say, a child is added.
  const syncTravellerCount = (kind: TravellerKind, value: string) => {
    const count = String(Math.max(0, Math.floor(Number(value) || 0)));
    setPriceRows((rows) =>
      rows.some((r) => r.kind === kind)
        ? rows.map((r) => (r.kind === kind ? { ...r, count } : r))
        : Number(count) > 0
          ? [...rows, { kind, label: travellerRowLabels[kind], count, rate: "" }]
          : rows
    );
  };
  const updatePriceRow = (index: number, patch: Partial<PriceRow>) =>
    setPriceRows((rows) => rows.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  const [initialAges] = useState(() => splitTravellerAges(defaults?.childAges ?? [], defaults?.children ?? 0));
  const [childAgeList, setChildAgeList] = useState<string[]>(initialAges.childAges);
  const [infantAgeList, setInfantAgeList] = useState<string[]>(initialAges.infantAges);

  // Children's ages first, then infants' - the order splitTravellerAges reads.
  const childSlots = countOf(children);
  const infantSlots = countOf(infants);
  const allAges = [
    ...Array.from({ length: childSlots }, (_, i) => childAgeList[i] ?? ""),
    ...Array.from({ length: infantSlots }, (_, i) => infantAgeList[i] ?? ""),
  ];
  const ageGroups = [
    { kind: "Child", slots: childSlots, list: childAgeList, setList: setChildAgeList, ages: CHILD_AGES },
    { kind: "Infant", slots: infantSlots, list: infantAgeList, setList: setInfantAgeList, ages: INFANT_AGES },
  ];
  const [startDate, setStartDate] = useState(defaults?.startDate ?? "");
  const [endDate, setEndDate] = useState(defaults?.endDate ?? "");
  const [dayRows, setDayRows] = useState<DayRow[]>(() =>
    defaults?.days?.length
      ? defaults.days.map((d) => ({ date: d.date ?? "", title: d.title ?? "", desc: d.desc ?? "" }))
      : [{ date: defaults?.startDate ?? "", title: "", desc: "" }]
  );
  const [nights, setNights] = useState(String(defaults?.durationNights ?? ""));
  const [days, setDays] = useState(String(defaults?.durationDays ?? ""));

  // Picking both travel dates fills Nights/Days (a 5 -> 10 Oct trip is
  // 5 nights / 6 days). Both dropdowns stay editable afterwards for the odd
  // trip that doesn't fit that shape.
  const onDatesChange = (start: string, end: string) => {
    // A new start date re-dates the itinerary: Day 1 on it, each day after
    // one date later. Changing only the end date leaves the days alone.
    if (start && start !== startDate) setDayRows((rows) => datesFromStart(rows, start));
    setStartDate(start);
    setEndDate(end);
    if (!start || !end) return;
    const diff = Math.round((Date.parse(end) - Date.parse(start)) / 86_400_000);
    if (diff < 0 || diff > MAX_DURATION_NIGHTS) return;
    setNights(String(diff));
    setDays(String(diff + 1));
  };
  const [roomCategory, setRoomCategory] = useState(defaults?.roomCategory ?? "");
  const [hotelCategory, setHotelCategory] = useState(defaults?.hotelCategory ?? "");

  const [inclusions, setInclusions] = useState<Set<string>>(new Set(defaults?.inclusions ?? []));
  // The automatic half of the PDF's Exclusions: every regular inclusion left
  // unticked (the free-text "Other" row is never an exclusion).
  const derivedExclusions = inclusionOptions
    .filter((o) => !o.freeText && !inclusions.has(o.value))
    .map((o) => o.label);

  // Whether the PDF prints the group size; asked under Pricing.
  const [showTravellerCount, setShowTravellerCount] = useState(defaults?.showTravellerCount ?? true);

  // Mirrors what the server will compute and store, so staff see the tax and
  // the grand total before saving instead of typing GST in by hand.
  // The package price is the breakup's sum - the same rule the server applies.
  const gst = priceLinesGst(parsePriceLines(priceRows), gstPercent);

  const roomCategoryIsOther = roomCategories.find((c) => c.value === roomCategory)?.freeText ?? false;

  const toggleInclusion = (value: string) => {
    setInclusions((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  // The empty option keeps a category clearable after one has been picked.
  const categoryOptions = (list: Option[], placeholder: string) => [{ value: "", label: placeholder }, ...list];

  return (
    <form
      id={FORM_ID}
      ref={formRef}
      onSubmit={onSubmit}
      onInput={markDirty}
      onChange={markDirty}
      onClick={markDirty}
      className="mt-6 space-y-6"
    >
      {restoredAt && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gold-400 bg-gold-400/10 px-4 py-3 text-sm text-ink-900">
          <p>
            Unsaved changes restored from{" "}
            {new Date(restoredAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}.
          </p>
          <button
            type="button"
            onClick={(e) => {
              // Not up to the form's onClick, which would save the draft
              // straight back after it's been removed.
              e.stopPropagation();
              onDiscardDraft();
            }}
            className="font-semibold text-ink-700 underline underline-offset-2 hover:text-red-600"
          >
            Discard and start over
          </button>
        </div>
      )}
      {!isNew && <input type="hidden" name="id" value={defaults?.id ?? ""} />}
      {defaults?.leadId && <input type="hidden" name="leadId" value={defaults.leadId} />}
      {returnToLead && <input type="hidden" name="returnTo" value="lead" />}

      <Section title="Customer">
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
        <div className="mb-5">
          <p className={labelClass}>Type</p>
          <input type="hidden" name="tripType" value={tripType} />
          <div className="inline-flex rounded-full border border-ink-200 bg-ink-50 p-1">
            {[
              { value: "domestic", label: "Domestic" },
              { value: "international", label: "International" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTripType(opt.value)}
                aria-pressed={tripType === opt.value}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  tripType === opt.value ? "bg-brand-600 text-white shadow-brand" : "text-ink-900 hover:text-brand-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

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
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={startDate}
              onChange={(e) => onDatesChange(e.target.value, endDate)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="endDate">Travel end date</label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={(e) => onDatesChange(startDate, e.target.value)}
              className={inputClass}
            />
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
        </div>
      </Section>

      <Section title="Vehicle">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
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

      <Section title="Travellers">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
          <div>
            <label className={labelClass} htmlFor="adults">Adults</label>
            <input
              id="adults"
              name="adults"
              type="number"
              min={0}
              value={adults}
              onChange={(e) => {
                setAdults(e.target.value);
                syncTravellerCount("adult", e.target.value);
              }}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="children">Children</label>
            <input
              id="children"
              name="children"
              type="number"
              min={0}
              max={MAX_AGE_ROWS}
              value={children}
              onChange={(e) => {
                setChildren(e.target.value);
                syncTravellerCount("child", e.target.value);
              }}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="infants">Infants</label>
            <input
              id="infants"
              name="infants"
              type="number"
              min={0}
              max={MAX_AGE_ROWS}
              value={infants}
              onChange={(e) => {
                setInfants(e.target.value);
                syncTravellerCount("infant", e.target.value);
              }}
              className={inputClass}
            />
          </div>
        </div>

        {/* One age dropdown per child and per infant, joined into the same
            newline-separated childAges field the server already parses. */}
        <input type="hidden" name="childAges" value={allAges.join("\n")} />
        {ageGroups.map(
          ({ kind, slots, list, setList, ages }) =>
            slots > 0 && (
              <div key={kind} className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
                {Array.from({ length: slots }, (_, i) => (
                  <div key={i}>
                    <label className={labelClass}>
                      {kind} {i + 1} age
                    </label>
                    <CustomSelect
                      value={list[i] ?? ""}
                      onChange={(v) =>
                        setList((prev) => {
                          const next = [...prev];
                          next[i] = v;
                          return next;
                        })
                      }
                      placeholder="Select age"
                      options={ageOptionsFor(ages, list[i])}
                    />
                  </div>
                ))}
              </div>
            )
        )}
      </Section>

      <Section title="Accommodation">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
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
            <label className={labelClass} htmlFor="hotelCategory">Hotel category</label>
            <CustomSelect name="hotelCategory" value={hotelCategory} onChange={setHotelCategory} placeholder="Select hotel category" options={categoryOptions(hotelCategories, "Select hotel category")} />
          </div>
          <div>
            <label className={labelClass} htmlFor="roomCategory">Room category</label>
            <CustomSelect name="roomCategory" value={roomCategory} onChange={setRoomCategory} placeholder="Select room category" options={categoryOptions(roomCategories, "Select room category")} />
            {!roomCategoryIsOther && <input type="hidden" name="roomCategoryOther" value="" />}
          </div>
          {roomCategoryIsOther && (
            <div>
              <label className={labelClass} htmlFor="roomCategoryOther">Specify room category</label>
              <input
                id="roomCategoryOther"
                name="roomCategoryOther"
                defaultValue={defaults?.roomCategoryOther}
                placeholder="Specify the room category"
                className={inputClass}
              />
            </div>
          )}
        </div>

        <div className="mt-6">
          <RepeatableRows
            name="stays"
            addLabel="Add hotel"
            bare
            initialRows={defaults?.stays ?? []}
            fields={[
              { key: "city", label: "City", type: "suggest", suggestions: citySuggestions },
              { key: "hotelName", label: "Hotel Name", type: "suggest", suggestions: hotelSuggestions },
              { key: "nights", label: "Nights", type: "number" },
              { key: "days", label: "Days", type: "number" },
            ]}
          />
        </div>
      </Section>

      <Section title="Itinerary">
        <ItineraryDays rows={dayRows} onChange={setDayRows} startDate={startDate} />
      </Section>

      <Section title="Inclusions">
        <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
          {inclusionOptions.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 whitespace-nowrap text-sm text-ink-900">
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
        {/* Always visible, as on the package form: every line typed here is
            printed whether or not "Other (Specify)" is ticked, so hiding the
            box behind that tick only hid where to type it. */}
        <div className="mt-6">
          <label className={labelClass} htmlFor="customInclusions">Other inclusions (one per line)</label>
          <textarea
            id="customInclusions"
            name="customInclusions"
            rows={8}
            defaultValue={defaults?.customInclusions?.join("\n")}
            placeholder={"Airport lounge access\nProfessional photoshoot"}
            className={inputClass}
          />
        </div>
      </Section>

      <Section title="Exclusions">
        {/* What the PDF will list under Exclusions, shown live: every
            inclusion left unticked, then the extra lines below. */}
        <p className={labelClass}>Added automatically (not ticked under Inclusions)</p>
        <p className="text-sm leading-relaxed text-ink-700">
          {derivedExclusions.length > 0 ? derivedExclusions.join(", ") : "None - every inclusion is ticked."}
        </p>

        <div className="mt-6">
          <label className={labelClass} htmlFor="exclusions">Additional exclusions (one per line)</label>
          <textarea
            id="exclusions"
            name="exclusions"
            rows={8}
            defaultValue={defaults?.exclusions?.join("\n")}
            placeholder={"GST and government taxes\nPersonal expenses, tips & shopping\nTravel insurance"}
            className={inputClass}
          />
        </div>
      </Section>

      <Section title="Pricing">
        {/* The per-person rows on the left, the running total beside them, so
            no field stretches across the whole card. */}
        <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <p className={labelClass}>Per-person price (enter before GST)</p>
            {!defaults?.priceLines?.length && defaults?.price ? (
              <p className="mb-3 text-sm text-ink-500">
                Saved earlier with a total of {formatRupees(defaults.price)} before GST. Enter the per-person rates
                below; the package price is worked out from them.
              </p>
            ) : null}
            <input
              type="hidden"
              name="priceLines"
              value={JSON.stringify(priceRows.map(({ label, count, rate }) => ({ label, count, rate })))}
            />
            {/* One header row and fixed columns, so every row's fields line up
                under their heading instead of the first row carrying labels. */}
            <div className="mt-3 overflow-hidden rounded-xl border border-ink-200">
              <div className={`${PRICE_ROW_GRID} border-b border-ink-200 bg-ink-50/60 px-4 py-2.5 text-xs font-bold text-ink-900`}>
                <span>Traveller type</span>
                <span>Travellers</span>
                <span>Rate / person (₹)</span>
                <span className="text-right">With GST</span>
                <span aria-hidden />
              </div>
              <div className="divide-y divide-ink-100">
              {priceRows.map((row, index) => {
                // Shown with GST added - the figure the customer will see.
                const rate = Number(row.rate) || 0;
                const amount = priceLineAmountWithGst({ label: row.label, count: Number(row.count) || 0, rate }, gstPercent);
                return (
                  <div key={index} className={`${PRICE_ROW_GRID} px-4 py-3`}>
                    <div className="min-w-0">
                      {row.custom ? (
                        <input
                          value={row.label}
                          onChange={(e) => updatePriceRow(index, { label: e.target.value })}
                          // Emptied: back to the list.
                          onBlur={() => !row.label.trim() && updatePriceRow(index, { custom: false, label: "" })}
                          autoFocus={!row.label}
                          placeholder="Type traveller type"
                          aria-label="Traveller type"
                          className={inputClass}
                        />
                      ) : (
                        <CustomSelect
                          value={row.label}
                          onChange={(v) =>
                            updatePriceRow(index, v === OTHER_TYPE ? { custom: true, label: "" } : { label: v })
                          }
                          placeholder="Select type"
                          options={travellerTypeOptions}
                        />
                      )}
                    </div>
                    <div>
                      <input
                        type="number"
                        min={0}
                        value={row.count}
                        onChange={(e) => updatePriceRow(index, { count: e.target.value })}
                        aria-label="Number of travellers"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        min={0}
                        value={row.rate}
                        onChange={(e) => updatePriceRow(index, { rate: e.target.value })}
                        placeholder="0"
                        aria-label="Rate per person"
                        className={inputClass}
                      />
                    </div>
                    <div className="flex flex-col justify-center whitespace-nowrap text-right leading-tight">
                      <span className="text-sm font-semibold text-ink-900">{formatRupees(amount)}</span>
                      {Number(row.count) > 1 && rate > 0 && (
                        <span className="mt-0.5 text-[11px] text-ink-500">{formatRupees(rateWithGst(rate, gstPercent))} / person</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setPriceRows((rows) => rows.filter((_, i) => i !== index))}
                      aria-label="Remove row"
                      className="grid h-8 w-8 place-items-center rounded-full text-ink-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
              </div>
              {priceRows.length < MAX_PRICE_LINES && (
                <button
                  type="button"
                  onClick={() => setPriceRows((rows) => [...rows, { label: "", count: "1", rate: "" }])}
                  className="flex w-full items-center gap-1.5 border-t border-ink-100 px-4 py-3 text-sm font-semibold text-brand-600 hover:bg-brand-50/50 hover:text-brand-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add traveller type
                </button>
              )}
            </div>

            {/* The divider sits on a wrapper: on the fieldset itself the
                browser draws its border through the legend. */}
            <div className="mt-6 border-t border-ink-100 pt-5">
            <fieldset>
              <legend className="text-sm font-medium text-ink-900">Show number of travellers on the itinerary?</legend>
              <input type="hidden" name="showTravellerCount" value={showTravellerCount ? "true" : "false"} />
              <div className="mt-2 inline-flex rounded-lg border border-ink-200 p-0.5">
                {[
                  { value: true, label: "Yes, show" },
                  { value: false, label: "No, hide" },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    aria-pressed={showTravellerCount === opt.value}
                    onClick={() => setShowTravellerCount(opt.value)}
                    className={`rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors ${
                      showTravellerCount === opt.value ? "bg-ink-900 text-white" : "text-ink-600 hover:bg-ink-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </fieldset>
            </div>
          </div>

          <div className="rounded-xl border border-ink-200 bg-ink-50/60 p-5 xl:mt-[26px]">
            <p className="text-xs font-bold uppercase tracking-wide text-ink-700">
              GST ({gstPercent}%), calculated automatically
            </p>
            <dl className="mt-4 space-y-2.5 text-sm text-ink-700">
              <div className="flex justify-between">
                <dt>Price before GST</dt>
                <dd className="font-medium text-ink-900">{formatRupees(gst.price)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>GST</dt>
                <dd className="font-medium text-ink-900">{formatRupees(gst.gstAmount)}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-ink-200 pt-3 font-bold text-ink-900">
                <dt>Total with GST</dt>
                <dd className="text-lg text-brand-600">{formatRupees(gst.totalAmount)}</dd>
              </div>
            </dl>
            <p className="mt-4 border-t border-ink-200 pt-3 text-xs leading-relaxed text-ink-500">
              The itinerary prints each rate and the total with GST already added, without a separate GST line.
              The rate comes from Settings and is saved onto this quotation, so reprints never change.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <label className={labelClass} htmlFor="notes">Internal notes (not printed)</label>
          <textarea id="notes" name="notes" rows={3} defaultValue={defaults?.notes} className={inputClass} />
        </div>
      </Section>

      <Section title="Standard Content">
        {/* An empty list (a draft saved before this section existed) falls
            back to the standard copy rather than an empty editor. */}
        <ContentBlocksEditor
          initial={defaults?.contentBlocks?.length ? defaults.contentBlocks : standardContentBlocks}
          standard={standardContentBlocks}
        />
      </Section>

      <Section title="Prepared By">
        {/* Printed on the PDF under the operation head. Starts as the
            signed-in staff member; leave both blank to keep it off the PDF. */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="preparedByName">Name</label>
            <input
              id="preparedByName"
              name="preparedByName"
              defaultValue={defaults?.preparedByName}
              placeholder="Full name"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="preparedByRole">Role</label>
            <input
              id="preparedByRole"
              name="preparedByRole"
              defaultValue={defaults?.preparedByRole}
              placeholder="e.g. Travel Executive"
              className={inputClass}
            />
          </div>
        </div>
      </Section>

      {state && "error" in state && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        // Stays disabled after a successful save while the page navigates
        // away, so a second click can't create a duplicate quotation.
        disabled={pending || saved}
        className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending || saved ? "Saving..." : isNew ? "Create & Generate PDF" : "Save Changes"}
      </button>
    </form>
  );
}
