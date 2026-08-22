import type { Inclusion, TourPackage } from "@/data/packages";
import {
  getAccommodationForPackage,
  getNightStayBreakdown,
  inferVehicleType,
} from "@/lib/itineraryPdfHelpers";

const inclusionLabels: Record<Inclusion, string> = {
  flight: "Return flights",
  hotel: "Hotel accommodation",
  meals: "Meals as per itinerary",
  transfer: "Airport & local transfers",
  sightseeing: "Guided sightseeing",
};

const quoteDateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function ItineraryPrintView({ pkg }: { pkg: TourPackage }) {
  const discount = Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100);
  const { hotel, categoryLabel } = getAccommodationForPackage(pkg);
  const nightStays = getNightStayBreakdown(pkg);
  const vehicleType = inferVehicleType(pkg);
  const quoteDate = quoteDateFormatter.format(new Date());

  return (
    <div className="hidden print:block">
      <header className="flex items-end justify-between border-b-2 border-brand-600 pb-3">
        <p className="font-heading text-xl font-extrabold text-brand-600">Snapingo</p>
        <p className="text-[10px] uppercase tracking-wide text-ink-500">
          A unit of SNAP Tour and Travels Pvt. Ltd.
        </p>
      </header>

      <div className="mt-4 flex items-center justify-between border-b border-ink-100 pb-3 text-[10px] uppercase tracking-wide text-ink-500">
        <span>Quotation generated: {quoteDate}</span>
        <span>Package Ref: {pkg.id}</span>
      </div>

      <div className="mt-5 flex gap-4 break-inside-avoid">
        {/* Plain <img>, not next/image: this block is display:none until
            print, so a lazy-loaded image would never have started
            fetching by the time the browser captures the print output. */}
        <img
          src={pkg.image}
          alt={pkg.title}
          loading="eager"
          className="h-28 w-40 shrink-0 rounded-lg border border-ink-200 object-cover"
        />
        <div className="min-w-0 flex-1">
          {pkg.badge && (
            <p className="text-[10px] font-bold uppercase tracking-wide text-brand-600">
              {pkg.badge}
            </p>
          )}
          <h1 className="mt-1 font-heading text-2xl font-bold text-ink-900">{pkg.title}</h1>
          <p className="mt-1 text-sm text-ink-600">{pkg.destination}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-700">
            <span>{pkg.duration}</span>
            <span className="text-ink-300">&bull;</span>
            <span className="capitalize">{pkg.type} trip</span>
            <span className="text-ink-300">&bull;</span>
            <span>
              {pkg.rating} / 5 ({pkg.reviews.toLocaleString("en-IN")} reviews)
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between break-inside-avoid rounded-lg border border-emerald-200 bg-emerald-50 px-5 py-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-700">
            Price Per Person
          </p>
          <p className="mt-1">
            <span className="font-heading text-3xl font-bold text-ink-900">
              ₹{pkg.price.toLocaleString("en-IN")}
            </span>{" "}
            <span className="text-sm text-ink-400 line-through">
              ₹{pkg.originalPrice.toLocaleString("en-IN")}
            </span>
          </p>
        </div>
        <p className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-bold text-white">
          {discount}% OFF
        </p>
      </div>

      {nightStays.length > 0 ? (
        <section className="mt-6 break-inside-avoid">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-ink-900">
            Accommodation
          </h2>
          <table className="mt-2 w-full border-collapse border border-ink-200 text-sm">
            <thead>
              <tr className="bg-ink-50 text-left text-ink-700">
                <th className="border border-ink-200 px-3 py-2 font-semibold">Destination</th>
                <th className="border border-ink-200 px-3 py-2 font-semibold">Hotel</th>
                <th className="border border-ink-200 px-3 py-2 font-semibold">Category</th>
              </tr>
            </thead>
            <tbody>
              {nightStays.map((stay) => (
                <tr key={stay.city}>
                  <td className="border border-ink-200 px-3 py-2 text-ink-900">
                    {stay.city} &mdash; {stay.nights} Night{stay.nights === 1 ? "" : "s"}
                  </td>
                  <td className="border border-ink-200 px-3 py-2 text-ink-900">
                    {stay.hotel ? stay.hotel.name : `Similar ${stay.categoryLabel.toLowerCase()} property`}
                  </td>
                  <td className="border border-ink-200 px-3 py-2 text-ink-900">
                    {stay.categoryLabel}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs leading-relaxed text-ink-700">
            Hotels listed above, or similar category properties, confirmed at the time of
            booking.
          </p>
        </section>
      ) : (
        <section className="mt-6 break-inside-avoid rounded-lg border border-ink-200 p-4">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-ink-900">
            Accommodation
          </h2>
          {hotel ? (
            <div className="mt-2">
              <p className="text-sm font-bold text-ink-900">{hotel.name}</p>
              <p className="mt-1 flex items-center gap-2">
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">
                  {categoryLabel}
                </span>
              </p>
              <p className="mt-2 text-xs leading-relaxed text-ink-700">
                Or a similar {categoryLabel.toLowerCase()} category property, confirmed at the
                time of booking.
              </p>
            </div>
          ) : (
            <p className="mt-2 text-xs leading-relaxed text-ink-700">
              Handpicked {categoryLabel.toLowerCase()} category hotels/resorts along the route,
              confirmed at the time of booking.
            </p>
          )}
        </section>
      )}

      <section className="mt-6 break-inside-avoid rounded-lg border border-ink-200 p-4">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-ink-900">
          Vehicle / Transport
        </h2>
        <p className="mt-2 text-sm font-bold text-ink-900">{vehicleType}</p>
        <p className="mt-2 text-xs leading-relaxed text-ink-700">
          Used for all airport/station pickups, drops, transfers and sightseeing listed in the
          itinerary below.
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

      <div className="mt-6 grid grid-cols-2 gap-4 break-inside-avoid">
        <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-emerald-800">
            Inclusions
          </h2>
          <ul className="mt-2 space-y-1 text-sm text-ink-800">
            {pkg.inclusions.map((inc) => (
              <li key={inc}>&bull; {inclusionLabels[inc]}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-red-800">
            Exclusions
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

      <section className="mt-6 break-inside-avoid rounded-lg border border-brand-200 bg-brand-50 p-4">
        <h2 className="font-heading text-sm font-bold uppercase tracking-wide text-brand-700">
          Need Help?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-800">
          Talk to a travel expert to confirm dates, customize this itinerary or complete your
          booking.
        </p>
        <p className="mt-2 text-sm font-bold text-ink-900">WhatsApp / Call: +91 87003 68575</p>
        <p className="mt-1 text-sm text-ink-800">Email: info@snapingo.com</p>
      </section>

      <footer className="mt-8 border-t border-ink-200 pt-3 text-[10px] text-ink-500">
        <p className="font-semibold text-ink-700">SNAPINGO TRAVELS</p>
        <p className="mt-1">
          NX One, Plot No. 17, Tech Zone 4, Greater Noida West, UP 201318
        </p>
        <p className="mt-1">+91 87003 68575 &middot; info@snapingo.com &middot; www.snapingo.com</p>
        <p className="mt-2">
          Hotel, room category and vehicle details above are indicative and subject to
          availability at the time of booking; a specific property and vehicle will be confirmed
          in your Booking Confirmation. Prices are per person, starting from. This itinerary is
          indicative: contact us to confirm final dates and inclusions.
        </p>
      </footer>
    </div>
  );
}
