"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { domesticDestinations, getDestinationBySlug, internationalDestinations } from "@/data/destinations";
import {
  destinationsByType,
  destinationTypeOptions,
  monthOptions,
  tripDaysOptions,
  tripPurposeOptions,
  type DestinationTypeValue,
} from "@/data/tripPlanner";
import { useAutoOpenOnce } from "@/hooks/useAutoOpenOnce";
import { useScrollLock } from "@/hooks/useScrollLock";
import CustomSelect from "@/components/CustomSelect";

// Pages that already show their own dedicated planning popup - skip this
// generic one there so visitors aren't shown two popups at once.
const SKIP_PATHS = ["/services/hotels", "/services/flights", "/services/travel-guide"];

type DateFixed = "yes" | "not-yet";
type OthersType = "domestic" | "international";
type StepId =
  | "purpose"
  | "destType"
  | "suggestion"
  | "othersType"
  | "othersDestination"
  | "dateFixed"
  | "exactDate"
  | "month"
  | "days"
  | "email"
  | "done";

function RadioRow({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3.5 text-left text-sm font-medium transition ${
        selected ? "border-brand-500 bg-brand-50 text-brand-700" : "border-ink-100 bg-ink-50 text-ink-900 hover:border-brand-200"
      }`}
    >
      <span
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
          selected ? "border-brand-600" : "border-ink-300"
        }`}
      >
        {selected && <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />}
      </span>
      {label}
    </button>
  );
}

export default function TripPlannerModal() {
  const pathname = usePathname();
  const [open, setOpen] = useAutoOpenOnce("snapingo-trip-planner-seen", 10000);
  const [step, setStep] = useState<StepId>("purpose");
  const [purpose, setPurpose] = useState("");
  const [destType, setDestType] = useState<DestinationTypeValue | null>(null);
  const [suggestionSlug, setSuggestionSlug] = useState("");
  const [othersType, setOthersType] = useState<OthersType>("domestic");
  const [customDestinationSlug, setCustomDestinationSlug] = useState("");
  const [dateFixed, setDateFixed] = useState<DateFixed | null>(null);
  const [exactDate, setExactDate] = useState("");
  const [month, setMonth] = useState("");
  const [days, setDays] = useState("");
  const [email, setEmail] = useState("");

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  if (SKIP_PATHS.includes(pathname)) return null;

  const baseSteps: StepId[] = ["purpose", "destType", "suggestion"];
  if (suggestionSlug === "others") baseSteps.push("othersType", "othersDestination");
  baseSteps.push("dateFixed");
  if (dateFixed === "yes") baseSteps.push("exactDate");
  else if (dateFixed === "not-yet") baseSteps.push("month");
  baseSteps.push("days", "email");
  const steps = baseSteps;
  const stepIndex = steps.indexOf(step);

  const suggestionOptions = destType
    ? [
        ...destinationsByType[destType]
          .map((slug) => getDestinationBySlug(slug))
          .filter((d): d is NonNullable<typeof d> => Boolean(d)),
      ]
    : [];

  const othersDestinationList = othersType === "domestic" ? domesticDestinations : internationalDestinations;
  const othersDestinationOptions = othersDestinationList.map((d) => ({ value: d.slug, label: d.name }));

  const resetAndClose = () => {
    setOpen(false);
    setStep("purpose");
    setPurpose("");
    setDestType(null);
    setSuggestionSlug("");
    setOthersType("domestic");
    setCustomDestinationSlug("");
    setDateFixed(null);
    setExactDate("");
    setMonth("");
    setDays("");
    setEmail("");
  };

  const goNext = () => {
    if (step === "email") {
      const purposeLabel = tripPurposeOptions.find((o) => o.value === purpose)?.label ?? purpose;
      const destTypeLabel = destinationTypeOptions.find((o) => o.value === destType)?.label ?? "";
      const suggestionName =
        suggestionSlug === "others"
          ? (getDestinationBySlug(customDestinationSlug)?.name ?? "Not sure yet")
          : (getDestinationBySlug(suggestionSlug)?.name ?? "");

      const lines = [
        "Hi Snapingo! I'd like help planning my trip.",
        "",
        `Looking for: ${purposeLabel}`,
        `Destination type: ${destTypeLabel}`,
        `Suggested destination: ${suggestionName}`,
        `Travel date fixed: ${dateFixed === "yes" ? "Yes" : "Not yet"}`,
        dateFixed === "yes" ? `Travel date: ${exactDate}` : `Preferred month: ${month}`,
        `Trip duration: ${days}`,
        email ? `Email: ${email}` : null,
        "",
        "Please share the best options and quotes.",
      ].filter((line): line is string => Boolean(line));

      const waHref = `https://wa.me/918700368575?text=${encodeURIComponent(lines.join("\n"))}`;
      window.open(waHref, "_blank", "noopener,noreferrer");
      setStep("done");
      return;
    }
    const nextIndex = stepIndex + 1;
    if (nextIndex < steps.length) setStep(steps[nextIndex]);
  };

  const goBack = () => {
    const prevIndex = stepIndex - 1;
    if (prevIndex >= 0) setStep(steps[prevIndex]);
  };

  const canProceed =
    step === "purpose"
      ? Boolean(purpose)
      : step === "destType"
        ? Boolean(destType)
        : step === "suggestion"
          ? Boolean(suggestionSlug)
          : step === "othersDestination"
            ? Boolean(customDestinationSlug)
            : step === "dateFixed"
              ? Boolean(dateFixed)
              : step === "exactDate"
                ? Boolean(exactDate)
                : step === "month"
                  ? Boolean(month)
                  : step === "days"
                ? Boolean(days)
                : true;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={resetAndClose}
          className="print-hide fixed inset-0 z-[60] flex items-center justify-center bg-ink-950/60 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
          >
            <div className="flex items-start justify-end px-6 pt-6">
              <button
                type="button"
                aria-label="Close"
                onClick={resetAndClose}
                className="grid h-9 w-9 place-items-center rounded-full text-ink-700 transition hover:bg-ink-100"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="overflow-y-auto px-6 pb-6 pt-3">
              {step === "purpose" && (
                <div>
                  <h2 className="font-heading text-lg font-bold text-ink-900">
                    Hey! Are you looking for help in planning your trip?
                  </h2>
                  <div className="mt-4 space-y-2.5">
                    {tripPurposeOptions.map((opt) => (
                      <RadioRow
                        key={opt.value}
                        label={opt.label}
                        selected={purpose === opt.value}
                        onClick={() => setPurpose(opt.value)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {step === "destType" && (
                <div>
                  <h2 className="font-heading text-lg font-bold text-ink-900">
                    May I know what kind of destination you are looking for?
                  </h2>
                  <div className="mt-4 space-y-2.5">
                    {destinationTypeOptions.map((opt) => (
                      <RadioRow
                        key={opt.value}
                        label={opt.label}
                        selected={destType === opt.value}
                        onClick={() => {
                          setDestType(opt.value);
                          setSuggestionSlug("");
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {step === "suggestion" && (
                <div>
                  <h2 className="font-heading text-lg font-bold text-ink-900">
                    Based on your requirements, here are some suggested destinations.
                  </h2>
                  <p className="mt-1 text-sm text-ink-600">You may select from below</p>
                  <div className="mt-4 space-y-2.5">
                    {suggestionOptions.map((d) => (
                      <RadioRow
                        key={d.slug}
                        label={d.name}
                        selected={suggestionSlug === d.slug}
                        onClick={() => {
                          setSuggestionSlug(d.slug);
                          setCustomDestinationSlug("");
                        }}
                      />
                    ))}
                    <RadioRow
                      label="Others"
                      selected={suggestionSlug === "others"}
                      onClick={() => setSuggestionSlug("others")}
                    />
                  </div>
                </div>
              )}

              {step === "othersType" && (
                <div>
                  <h2 className="font-heading text-lg font-bold text-ink-900">
                    Is it a domestic or international destination?
                  </h2>
                  <div className="mt-4 space-y-2.5">
                    <RadioRow
                      label="Domestic"
                      selected={othersType === "domestic"}
                      onClick={() => {
                        setOthersType("domestic");
                        setCustomDestinationSlug("");
                      }}
                    />
                    <RadioRow
                      label="International"
                      selected={othersType === "international"}
                      onClick={() => {
                        setOthersType("international");
                        setCustomDestinationSlug("");
                      }}
                    />
                  </div>
                </div>
              )}

              {step === "othersDestination" && (
                <div>
                  <h2 className="font-heading text-lg font-bold text-ink-900">
                    Which destination are you looking for?
                  </h2>
                  <p className="mt-1 text-sm text-ink-600">
                    Pick a {othersType === "domestic" ? "state or city" : "country"}
                  </p>
                  <div className="mt-4">
                    <CustomSelect
                      value={customDestinationSlug}
                      onChange={setCustomDestinationSlug}
                      options={othersDestinationOptions}
                      placeholder="Select a destination"
                    />
                  </div>
                </div>
              )}

              {step === "dateFixed" && (
                <div>
                  <h2 className="font-heading text-lg font-bold text-ink-900">
                    Is your travel date fixed?
                  </h2>
                  <div className="mt-4 space-y-2.5">
                    <RadioRow
                      label="Yes"
                      selected={dateFixed === "yes"}
                      onClick={() => setDateFixed("yes")}
                    />
                    <RadioRow
                      label="Not Yet"
                      selected={dateFixed === "not-yet"}
                      onClick={() => setDateFixed("not-yet")}
                    />
                  </div>
                </div>
              )}

              {step === "exactDate" && (
                <div>
                  <h2 className="font-heading text-lg font-bold text-ink-900">
                    What&apos;s your travel date?
                  </h2>
                  <input
                    type="date"
                    value={exactDate}
                    onChange={(e) => setExactDate(e.target.value)}
                    className="mt-4 w-full rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              )}

              {step === "month" && (
                <div>
                  <h2 className="font-heading text-lg font-bold text-ink-900">
                    In which month are you planning to go?
                  </h2>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="mt-4 w-full rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  >
                    <option value="" disabled>
                      Select month
                    </option>
                    {monthOptions.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {step === "days" && (
                <div>
                  <h2 className="font-heading text-lg font-bold text-ink-900">
                    For how many days will your trip be?
                  </h2>
                  <select
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    className="mt-4 w-full rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  >
                    <option value="" disabled>
                      Select duration
                    </option>
                    {tripDaysOptions.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {step === "email" && (
                <div>
                  <h2 className="font-heading text-lg font-bold text-ink-900">Your Email ID</h2>
                  <p className="mt-1 text-sm text-ink-600">
                    We&apos;ll pass this on so our travel expert can send you the best quotes
                    (optional).
                  </p>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Please mention your Email Id"
                    className="mt-4 w-full rounded-lg border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              )}

              {step === "done" && (
                <div className="flex flex-col items-center gap-3 py-6 text-center">
                  <span className="grid h-16 w-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                    <CheckCircle2 className="h-8 w-8" />
                  </span>
                  <h3 className="font-heading text-xl font-bold text-ink-900">
                    You will be notified
                  </h3>
                </div>
              )}
            </div>

            {step !== "done" && (
              <div className="flex items-center justify-between border-t border-ink-100 px-6 py-4">
                {stepIndex > 0 ? (
                  <button
                    type="button"
                    onClick={goBack}
                    className="flex items-center gap-1 text-sm font-bold text-brand-600 transition hover:text-brand-700"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Back
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  disabled={!canProceed}
                  onClick={goNext}
                  className="flex items-center gap-1.5 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-700 disabled:pointer-events-none disabled:opacity-40"
                >
                  {step === "email" ? "Get My Quote" : "Next"}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {step === "done" && (
              <div className="border-t border-ink-100 px-6 py-4">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-ink-200 px-6 py-3 text-sm font-semibold text-ink-800 transition hover:border-brand-400 hover:text-brand-600"
                >
                  Done
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
