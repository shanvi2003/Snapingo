"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { BedDouble, Calendar, ChevronLeft, MapPin, Star, Wallet, X } from "lucide-react";
import type { Destination } from "@/data/destinations";
import {
  hotelCategoryOptions,
  priceRangeOptions,
  type HotelCategory,
  type PriceRange,
} from "@/data/hotels";
import CustomSelect from "@/components/CustomSelect";
import { useAutoOpenOnce } from "@/hooks/useAutoOpenOnce";
import { useScrollLock } from "@/hooks/useScrollLock";

type TripType = "domestic" | "international";
type Step = 1 | 2 | 3;

const STEP_LABELS: Record<Step, string> = {
  1: "Destination",
  2: "Budget",
  3: "Dates",
};

export default function HotelBookingModal({ destinations }: { destinations: Destination[] }) {
  const router = useRouter();
  // 2.5s so the page's own entrance animations finish before this pops up.
  const [open, setOpen] = useAutoOpenOnce("snapingo-hotel-flow-seen", 2500);
  const [step, setStep] = useState<Step>(1);
  const [tripType, setTripType] = useState<TripType>("domestic");
  const [destinationSlug, setDestinationSlug] = useState("");
  const [category, setCategory] = useState<HotelCategory | null>(null);
  const [priceRange, setPriceRange] = useState<PriceRange>("any");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

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

  const resetAndClose = () => {
    setOpen(false);
    setStep(1);
    setTripType("domestic");
    setDestinationSlug("");
    setCategory(null);
    setPriceRange("any");
    setCheckIn("");
    setCheckOut("");
  };

  const handleSearch = () => {
    if (!category) return;
    const params = new URLSearchParams({
      tripType,
      destination: destinationSlug,
      category,
      price: priceRange,
      checkIn,
      checkOut,
    });
    setOpen(false);
    router.push(`/hotel-results?${params.toString()}`);
  };

  const canProceedStep1 = Boolean(destinationSlug);
  const canProceedStep2 = category !== null;
  const canProceedStep3 = Boolean(checkIn && checkOut) && checkOut >= checkIn;

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="print-hide fixed bottom-6 left-5 z-40 flex items-center gap-2 rounded-full bg-ink-900 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-ink-800 sm:bottom-8 sm:left-8"
        >
          <BedDouble className="h-4.5 w-4.5 text-brand-300" />
          Find a Hotel
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
                  {step > 1 && (
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
                      Plan Your Stay
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

              <div className="flex gap-1.5 px-6 pt-4">
                {([1, 2, 3] as const).map((s) => (
                  <span
                    key={s}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      s <= step ? "bg-brand-500" : "bg-ink-100"
                    }`}
                  />
                ))}
              </div>

              <div className="overflow-y-auto px-6 py-6">
                {step === 1 && (
                  <div>
                    <p className="text-sm text-ink-900">Where would you like to stay?</p>
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
                    <p className="text-sm text-ink-900">What star category do you prefer?</p>
                    <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {hotelCategoryOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setCategory(opt.value)}
                          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                            category === opt.value
                              ? "border-brand-500 bg-brand-50 text-brand-700"
                              : "border-ink-200 text-ink-900 hover:border-brand-300"
                          }`}
                        >
                          <Star className="h-4 w-4 shrink-0 fill-current" />
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {category && (
                      <div className="mt-6">
                        <p className="text-sm text-ink-900">
                          What&apos;s your price range (per person, per night)?
                        </p>
                        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                          {priceRangeOptions.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setPriceRange(opt.value)}
                              className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                                priceRange === opt.value
                                  ? "border-brand-500 bg-brand-50 text-brand-700"
                                  : "border-ink-200 text-ink-900 hover:border-brand-300"
                              }`}
                            >
                              <Wallet className="h-4 w-4 shrink-0" />
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <p className="text-sm text-ink-900">When do you need the stay?</p>
                    <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="hotel-checkin" className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-900">
                          <Calendar className="h-3.5 w-3.5" />
                          Check-in
                        </label>
                        <input
                          id="hotel-checkin"
                          type="date"
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                        />
                      </div>
                      <div>
                        <label htmlFor="hotel-checkout" className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-900">
                          <Calendar className="h-3.5 w-3.5" />
                          Check-out
                        </label>
                        <input
                          id="hotel-checkout"
                          type="date"
                          value={checkOut}
                          min={checkIn || undefined}
                          onChange={(e) => setCheckOut(e.target.value)}
                          className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                        />
                      </div>
                    </div>
                    {checkIn && checkOut && checkOut < checkIn && (
                      <p className="mt-3 text-xs font-medium text-red-600">
                        Check-out date can&apos;t be before check-in.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="border-t border-ink-100 px-6 py-4">
                <button
                  type="button"
                  disabled={
                    step === 1 ? !canProceedStep1 : step === 2 ? !canProceedStep2 : !canProceedStep3
                  }
                  onClick={() => (step === 3 ? handleSearch() : setStep((s) => (s + 1) as Step))}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-brand transition hover:-translate-y-0.5 hover:bg-brand-700 disabled:pointer-events-none disabled:opacity-40 disabled:hover:translate-y-0"
                >
                  {step === 3 ? "Show Hotels" : "Continue"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
