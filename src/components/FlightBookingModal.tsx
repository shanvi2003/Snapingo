"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, ChevronLeft, Plane, PlaneLanding, PlaneTakeoff, X } from "lucide-react";
import { domesticDestinations, internationalDestinations } from "@/data/destinations";
import { flightClassOptions, majorIndianCities, type FlightClass } from "@/data/flights";
import CustomSelect from "@/components/CustomSelect";
import { useAutoOpenOnce } from "@/hooks/useAutoOpenOnce";
import { useScrollLock } from "@/hooks/useScrollLock";

type ArrivalType = "domestic" | "international";
type TripType = "one-way" | "round-trip";
type Step = 1 | 2 | 3;

const STEP_LABELS: Record<Step, string> = {
  1: "Route",
  2: "Class",
  3: "Dates",
};

export default function FlightBookingModal() {
  const router = useRouter();
  const [open, setOpen] = useAutoOpenOnce("snapingo-flight-flow-seen");
  const [step, setStep] = useState<Step>(1);
  const [tripType, setTripType] = useState<TripType>("round-trip");
  const [departureCitySlug, setDepartureCitySlug] = useState("");
  const [arrivalType, setArrivalType] = useState<ArrivalType>("domestic");
  const [destinationSlug, setDestinationSlug] = useState("");
  const [flightClass, setFlightClass] = useState<FlightClass | null>(null);
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  const departureOptions = majorIndianCities.map((c) => ({ value: c.slug, label: c.name }));
  const arrivalList = arrivalType === "domestic" ? domesticDestinations : internationalDestinations;
  const arrivalOptions = arrivalList.map((d) => ({ value: d.slug, label: d.name }));

  const resetAndClose = () => {
    setOpen(false);
    setStep(1);
    setTripType("round-trip");
    setDepartureCitySlug("");
    setArrivalType("domestic");
    setDestinationSlug("");
    setFlightClass(null);
    setDepartDate("");
    setReturnDate("");
  };

  const handleSearch = () => {
    if (!flightClass) return;
    const params = new URLSearchParams({
      tripType,
      from: departureCitySlug,
      to: destinationSlug,
      flightClass,
      departDate,
      returnDate: tripType === "round-trip" ? returnDate : "",
    });
    setOpen(false);
    router.push(`/flight-results?${params.toString()}`);
  };

  const canProceedStep1 = Boolean(departureCitySlug && destinationSlug);
  const canProceedStep2 = flightClass !== null;
  const canProceedStep3 =
    Boolean(departDate) &&
    (tripType === "one-way" || (Boolean(returnDate) && returnDate >= departDate));

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="print-hide fixed bottom-6 left-5 z-40 flex items-center gap-2 rounded-full bg-ink-900 px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-ink-800 sm:bottom-8 sm:left-8"
        >
          <Plane className="h-4.5 w-4.5 text-brand-300" />
          Find a Flight
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
                      Plan Your Flight
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
                    <p className="text-sm text-ink-900">One-way or round-trip?</p>
                    <div className="mt-4 flex w-max gap-1.5 rounded-full border border-ink-100 bg-ink-50 p-1.5">
                      <button
                        type="button"
                        onClick={() => setTripType("one-way")}
                        className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                          tripType === "one-way" ? "bg-brand-600 text-white shadow-brand" : "text-ink-900 hover:text-brand-600"
                        }`}
                      >
                        One-way
                      </button>
                      <button
                        type="button"
                        onClick={() => setTripType("round-trip")}
                        className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                          tripType === "round-trip" ? "bg-brand-600 text-white shadow-brand" : "text-ink-900 hover:text-brand-600"
                        }`}
                      >
                        Round-trip
                      </button>
                    </div>

                    <div className="mt-5">
                      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-900">
                        <PlaneTakeoff className="h-3.5 w-3.5" />
                        Departure City
                      </p>
                      <CustomSelect
                        value={departureCitySlug}
                        onChange={setDepartureCitySlug}
                        options={departureOptions}
                        placeholder="Select a city in India"
                      />
                    </div>

                    <div className="mt-5">
                      <div className="flex w-max gap-1.5 rounded-full border border-ink-100 bg-ink-50 p-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setArrivalType("domestic");
                            setDestinationSlug("");
                          }}
                          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                            arrivalType === "domestic" ? "bg-brand-600 text-white shadow-brand" : "text-ink-900 hover:text-brand-600"
                          }`}
                        >
                          Domestic
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setArrivalType("international");
                            setDestinationSlug("");
                          }}
                          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                            arrivalType === "international" ? "bg-brand-600 text-white shadow-brand" : "text-ink-900 hover:text-brand-600"
                          }`}
                        >
                          International
                        </button>
                      </div>
                      <p className="mb-1.5 mt-4 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-900">
                        <PlaneLanding className="h-3.5 w-3.5" />
                        Arrival Destination
                      </p>
                      <CustomSelect
                        value={destinationSlug}
                        onChange={setDestinationSlug}
                        options={arrivalOptions}
                        placeholder={arrivalType === "domestic" ? "Select a state or city" : "Select a country"}
                      />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <p className="text-sm text-ink-900">Which class would you like to fly?</p>
                    <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                      {flightClassOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFlightClass(opt.value)}
                          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
                            flightClass === opt.value
                              ? "border-brand-500 bg-brand-50 text-brand-700"
                              : "border-ink-200 text-ink-900 hover:border-brand-300"
                          }`}
                        >
                          <Plane className="h-4 w-4 shrink-0" />
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div>
                    <p className="text-sm text-ink-900">When do you want to fly?</p>
                    <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label htmlFor="flight-depart" className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-900">
                          <Calendar className="h-3.5 w-3.5" />
                          Departure Date
                        </label>
                        <input
                          id="flight-depart"
                          type="date"
                          value={departDate}
                          onChange={(e) => setDepartDate(e.target.value)}
                          className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                        />
                      </div>
                      {tripType === "round-trip" && (
                        <div>
                          <label htmlFor="flight-return" className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-900">
                            <Calendar className="h-3.5 w-3.5" />
                            Return Date
                          </label>
                          <input
                            id="flight-return"
                            type="date"
                            value={returnDate}
                            min={departDate || undefined}
                            onChange={(e) => setReturnDate(e.target.value)}
                            className="w-full rounded-xl border border-ink-200 bg-white px-4 py-3 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                          />
                        </div>
                      )}
                    </div>
                    {tripType === "round-trip" && departDate && returnDate && returnDate < departDate && (
                      <p className="mt-3 text-xs font-medium text-red-600">
                        Return date can&apos;t be before the departure date.
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
                  {step === 3 ? "Show Flights" : "Continue"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
