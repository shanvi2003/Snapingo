import type { Inclusion, TourPackage } from "@/data/packages";

const inclusionLabels: Record<Inclusion, string> = {
  flight: "Return flights",
  hotel: "Hotel accommodation",
  meals: "Meals as per itinerary",
  transfer: "Airport & local transfers",
  sightseeing: "Guided sightseeing",
};

export default function ItineraryPrintView({ pkg }: { pkg: TourPackage }) {
  const discount = Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100);

  return (
    <div className="hidden print:block">
      <header className="flex items-end justify-between border-b-2 border-brand-600 pb-3">
        <p className="font-heading text-xl font-extrabold text-brand-600">Snapingo</p>
        <p className="text-[10px] uppercase tracking-wide text-ink-500">
          A unit of SNAP Tour and Travels Pvt. Ltd.
        </p>
      </header>

      <div className="mt-5">
        {pkg.badge && (
          <p className="text-[10px] font-bold uppercase tracking-wide text-brand-600">
            {pkg.badge}
          </p>
        )}
        <h1 className="mt-1 font-heading text-2xl font-bold text-ink-900">{pkg.title}</h1>
        <p className="mt-1 text-sm text-ink-600">{pkg.destination}</p>
      </div>

      <table className="mt-5 w-full border-collapse border border-ink-200 text-sm">
        <tbody>
          <tr className="border-b border-ink-200">
            <td className="w-1/4 border-r border-ink-200 bg-ink-50 px-3 py-2 font-semibold text-ink-700">
              Duration
            </td>
            <td className="px-3 py-2 text-ink-900">{pkg.duration}</td>
            <td className="w-1/4 border-x border-ink-200 bg-ink-50 px-3 py-2 font-semibold text-ink-700">
              Rating
            </td>
            <td className="px-3 py-2 text-ink-900">
              {pkg.rating} / 5 ({pkg.reviews.toLocaleString("en-IN")} reviews)
            </td>
          </tr>
          <tr>
            <td className="border-r border-ink-200 bg-ink-50 px-3 py-2 font-semibold text-ink-700">
              Price per person
            </td>
            <td className="px-3 py-2 text-ink-900">
              <span className="font-bold">₹{pkg.price.toLocaleString("en-IN")}</span>{" "}
              <span className="text-ink-400 line-through">
                ₹{pkg.originalPrice.toLocaleString("en-IN")}
              </span>
            </td>
            <td className="border-x border-ink-200 bg-ink-50 px-3 py-2 font-semibold text-ink-700">
              Discount
            </td>
            <td className="px-3 py-2 text-ink-900">{discount}% off</td>
          </tr>
        </tbody>
      </table>

      <section className="mt-6 break-inside-avoid">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-ink-900">
          About Snapingo
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-800">
          Snapingo Travel was built to give the modern traveller flexibility and a genuine sense
          of independence in planning a trip. We curate all-inclusive holiday packages, flights,
          stay, transfers and sightseeing, bundled into a single booking, backed by an in-house
          team that stays reachable through the whole journey, not just at the time of booking.
        </p>
      </section>

      <section className="mt-6 break-inside-avoid">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-ink-900">
          Highlights
        </h2>
        <ul className="mt-2 space-y-1 text-sm text-ink-800">
          {pkg.highlights.map((h) => (
            <li key={h}>&bull; {h}</li>
          ))}
        </ul>
      </section>

      <div className="mt-6 grid grid-cols-2 gap-8 break-inside-avoid">
        <section>
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-ink-900">
            Inclusion
          </h2>
          <ul className="mt-2 space-y-1 text-sm text-ink-800">
            {pkg.inclusions.map((inc) => (
              <li key={inc}>&bull; {inclusionLabels[inc]}</li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-ink-900">
            Exclusion
          </h2>
          <ul className="mt-2 space-y-1 text-sm text-ink-800">
            {pkg.exclusions.map((ex) => (
              <li key={ex}>&bull; {ex}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-6">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-ink-900">
          Day-by-Day Itinerary
        </h2>
        <div className="mt-2 space-y-3">
          {pkg.itinerary.map((day) => (
            <div key={day.day} className="break-inside-avoid border-t border-ink-100 pt-2">
              <p className="font-heading text-sm font-bold text-ink-900">
                Day {day.day}: {day.title}
              </p>
              <p className="mt-0.5 text-sm leading-relaxed text-ink-800">{day.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 break-inside-avoid">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-ink-900">
          Terms & Conditions
        </h2>
        <ul className="mt-2 space-y-1 text-sm text-ink-800">
          <li>&bull; Packages can be customized, except Fixed Departure tours which follow a pre-set itinerary.</li>
          <li>&bull; All change requests must be communicated to Snapingo Travel in writing.</li>
          <li>&bull; Services are provided strictly as detailed in the official Booking Confirmation.</li>
          <li>&bull; Snapingo Travel is not liable for delays or cancellations caused by natural calamities, strikes, political unrest, or other unforeseen events.</li>
          <li>&bull; Jurisdiction: legal disputes are subject to competent courts in Uttar Pradesh / Delhi NCR.</li>
        </ul>
      </section>

      <section className="mt-6 break-inside-avoid">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-ink-900">
          Payment Policy
        </h2>
        <ul className="mt-2 space-y-1 text-sm text-ink-800">
          <li>&bull; Standard packages: 75% advance at booking, 25% on arrival.</li>
          <li>&bull; Himachal packages: 50% advance, 50% on arrival.</li>
          <li>&bull; 4-star / 5-star &amp; luxury packages: 100% advance required.</li>
          <li>&bull; Accepted modes: Bank Transfer (NEFT/RTGS/IMPS), UPI, Cheque.</li>
        </ul>
      </section>

      <section className="mt-6 break-inside-avoid">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-ink-900">
          Cancellation Policy
        </h2>
        <ul className="mt-2 space-y-1 text-sm text-ink-800">
          <li>&bull; Token / advance payment is non-refundable in all cases.</li>
          <li>&bull; 15+ days before departure: 25% to 50% cancellation fee.</li>
          <li>&bull; Within 15 days, or a no-show: 100% retention, no refund.</li>
          <li>&bull; No refunds for unused flights, hotels, meals or sightseeing.</li>
        </ul>
      </section>

      <footer className="mt-8 border-t border-ink-200 pt-3 text-[10px] text-ink-500">
        <p className="font-semibold text-ink-700">SNAPINGO TRAVELS</p>
        <p className="mt-1">
          NX One, Plot No. 17, Tech Zone 4, Greater Noida West, UP 201318
        </p>
        <p className="mt-1">+91 87003 68575 &middot; info@snapingo.com &middot; www.snapingo.com</p>
        <p className="mt-2">
          Prices are per person, starting from, and subject to availability at the time of
          booking. This itinerary is indicative: contact us to confirm final dates and
          inclusions.
        </p>
      </footer>
    </div>
  );
}
