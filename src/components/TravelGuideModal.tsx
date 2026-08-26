"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, CheckCircle2, ChevronLeft, Compass, MapPin, Users, X } from "lucide-react";
import type { Destination } from "@/data/destinations";
import CustomSelect from "@/components/CustomSelect";
import { useAutoOpenOnce } from "@/hooks/useAutoOpenOnce";
import { useScrollLock } from "@/hooks/useScrollLock";
import { createLeadAction } from "@/lib/actions/leads";

type TripType = "domestic" | "international";
type Step = 1 | 2 | 3;

const STEP_LABELS: Record<Step, string> = {
  1: "Destination",
  2: "Trip Details",
  3: "Request Sent",
};

export default function TravelGuideModal({ destinations }: { destinations: Destination[] }) {
  // 2.5s so the page's own entrance animations finish before this pops up.
  const [open, setOpen] = useAutoOpenOnce("snapingo-travelguide-flow-seen", 2500);
  const [step, setStep] = useState<Step>(1);
  const [tripType, setTripType] = useState<TripType>("domestic");
  const [destinationSlug, setDestinationSlug] = useState("");
  const [days, setDays] = useState("");
  const [startDate, setStartDate] = useState("");
  const [sending, setSending] = useState(false);

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const destinationList = destinations.filter((d) => d.type === tripType);
  const destinationOptions = destinationList.map((d) => ({ value: d.slug, label: d.name }));
  const selectedDestination = destinationList.find((d) => d.slug === destinationSlug);

  const resetAndClose = () => {
    setOpen(false);
    setStep(1);
    setTripType("domestic");
    setDestinationSlug("");
    setDays("");
    setStartDate("");
    setSending(false);
  };

  const handleSend = () => {
    // A fast double-tap can fire this twice before the step-3 re-render
    // unmounts the button - guard explicitly instead of relying on that.
    if (sending) return;
    setSending(true);
    const lines = [
      "Hi Snapingo! I'd like help planning a trip.",
      "",
      `Trip type: ${tripType === "domestic" ? "Domestic" : "International"}`,
      `Destination: ${selectedDestination?.name ?? ""}`,
      `Duration: ${days} day${days === "1" ? "" : "s"}`,
      `Preferred start date: ${startDate || "TBD"}`,
      "",
      "Please let me know your availability and how you can help plan this trip.",
    ];
    const waHref = `https://wa.me/918700368575?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(waHref, "_blank", "noopener,noreferrer");
    setStep(3);

    // Fire-and-forget: never let a DB hiccup affect the WhatsApp redirect above.
    createLeadAction({
      source: "TRAVEL_GUIDE",
      tripType,
      destinationSlug,
      destinationName: selectedDestination?.name,
      days,
      startDate: startDate || undefined,
      pageUrl: window.location.pathname,
    }).catch((err) => console.warn("Lead save failed", err));
  };

  const canProceedStep1 = Boolean(destinationSlug);
  const canProceedStep2 = Boolean(days) && Number(days) > 0 && Boolean(startDate);

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="print-hide fixed bottom-6 left-5 z-40 flex items-center gap-2 rounded-full bg-ink-900 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-ink-800 sm:bottom-8 sm:left-8"
        >
          <Compass className="h-4.5 w-4.5 text-brand-300" />
          Plan My Trip
        </button>
      )}

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={resetAndClose}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-ink-950/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
                <div className="flex items-center gap-2">
                  {step > 1 && step < 3 && (
                    <button
                      type="button"
                      aria-label="Go back"
                      onClick={() => setStep((s) => (s - 1) as Step)}
                      className="grid h-8 w-8 place-items-center rounded-full text-ink-700 transition hover:bg-ink-100"
                    >
                      <ChevronLeft className="h-4.5 w-4.5" />
                    </button>
                  )}
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-brand-500">
                      Plan Your Trip
                    </p>
                    <h2 className="font-heading text-lg font-bold text-ink-900">
                      {STEP_LABELS[step]}
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={resetAndClose}
                  className="grid h-9 w-9 place-items-center rounded-full text-ink-700 transition hover:bg-ink-100"
                >
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {step < 3 && (
                <div className="flex gap-1.5 px-6 pt-4">
                  {([1, 2] as const).map((s) => (
                    <span
                      key={s}
                      className={`h-1.5 flex-1 rounded-full transition-colors ${
                        s <= step ? "bg-brand-500" : "bg-ink-100"
                      }`}
                    />
                  ))}
                </div>
              )}

              <div className="overflow-y-auto px-6 py-6">
                {step === 1 && (
                  <div>
                    <p className="text-sm text-ink-900">Where are you planning to go?</p>
                    <div className="mt-4 flex w-max gap-1.5 rounded-full border border-ink-100 bg-ink-50 p-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setTripType("domestic");
                          setDestinationSlug("");
                        }}
                        className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                          tripType === "domestic" ? "bg-brand-600 text-white shadow-brand" : "text-ink-900 hover:text-brand-600"
                        }`}
                      >
                        Domestic
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setTripType("international");
                          setDestinationSlug("");
                        }}
                        className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                          tripType === "international" ? "bg-brand-600 text-white shadow-brand" : "text-ink-900 hover:text-brand-600"
                        }`}
                      >
                        International
                      </button>
                    </div>

                    <div className="mt-5">
                      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-900">
                        <MapPin className="h-3.5 w-3.5" />
                        Destination
                      </p>
                      <CustomSelect
                        value={destinationSlug}
                        onChange={setDestinationSlug}
                        options={destinationOptions}
                        placeholder={tripType === "domestic" ? "Select a state or city" : "Select a country"}
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <p className="text-sm text-ink-900">How long and when?</p>
                    <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="trip-days" className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-900">
                          <Users className="h-3.5 w-3.5" />
                          Number of Days
                        </label>
                        <input
                          id="trip-days"
                          type="number"
                          min={1}
                          value={days}
                          onChange={(e) => setDays(e.target.value)}
                          placeholder="e.g. 5"
                          className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                        />
                      </div>
                      <div>
                        <label htmlFor="trip-start-date" className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-900">
                          <Calendar className="h-3.5 w-3.5" />
                          Preferred Start Date
                        </label>
                        <input
                          id="trip-start-date"
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className="flex flex-col items-center gap-3 py-6 text-center">
                    <motion.span
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 18 }}
                      className="relative grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-emerald-600"
                    >
                      <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20" />
                      <CheckCircle2 className="h-10 w-10" />
                    </motion.span>
                    <h3 className="font-heading text-xl font-bold text-ink-900">Request Sent!</h3>
                    <p className="max-w-xs text-sm text-ink-500">
                      Our travel expert will send your personalized travel guide on WhatsApp shortly.
                    </p>
                  </div>
                )}
              </div>

              {step < 3 && (
                <div className="border-t border-ink-100 px-6 py-4">
                  <button
                    type="button"
                    disabled={step === 1 ? !canProceedStep1 : !canProceedStep2 || sending}
                    onClick={() => (step === 2 ? handleSend() : setStep((s) => (s + 1) as Step))}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-brand transition hover:-translate-y-0.5 hover:bg-brand-700 disabled:pointer-events-none disabled:opacity-40 disabled:hover:translate-y-0"
                  >
                    {step === 2 ? "Send Request" : "Continue"}
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="border-t border-ink-100 px-6 py-4">
                  <button
                    type="button"
                    onClick={resetAndClose}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-brand transition hover:-translate-y-0.5 hover:bg-brand-700"
                  >
                    Done
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
