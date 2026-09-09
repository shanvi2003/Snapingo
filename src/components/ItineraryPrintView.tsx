import { User } from "lucide-react";
import type { Inclusion, TourPackage } from "@/data/packages";
import {
  getAccommodationForPackage,
  getNightStayBreakdown,
  inferVehicleType,
} from "@/lib/itineraryPdfHelpers";
import { siteConfig } from "@/lib/siteConfig";

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

// The one contact this itinerary format names by name (per the approved
// design) rather than pulling from siteConfig, which only holds the
// company-wide support line/email.
const operationHead = {
  name: "Ashutosh Pandey",
  phone: "+91 87077 36609",
  email: "ashutosh@snapingo.com",
};

// Every font size below (the text-[Npx] values) was measured directly off
// the reference PDF's content stream, not eyeballed: each text run's
// transform matrix was read out of Itinerary.pdf (a 1080x1521.34pt
// Illustrator export) via pdfjs-dist, then scaled pt -> our A4-at-96dpi px
// by the page-width ratio (793.7/1080 = 0.7349). Where the scaled value
// lands within ~1px of a Tailwind step (e.g. 14, 16, 20, 24, 36) that step
// is used instead of an arbitrary value.
// break-after-avoid, not break-inside-avoid on the whole section: gluing
// only the heading to whatever comes right after it stops it being
// stranded alone at a page bottom, without forcing the entire
// paragraph/list below it to jump as one indivisible block - which was
// leaving large blank gaps whenever that whole block didn't fit in the
// room left on the page.
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="inline-block break-after-avoid border-b-2 border-brand-600 pb-1 text-[28px] font-extrabold uppercase tracking-wide text-brand-600">
      {children}
    </h2>
  );
}

export default function ItineraryPrintView({ pkg }: { pkg: TourPackage }) {
  const discount = Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100);
  const { hotel, categoryLabel } = getAccommodationForPackage(pkg);
  const nightStays = getNightStayBreakdown(pkg);
  const vehicleType = inferVehicleType(pkg);
  const quoteDate = quoteDateFormatter.format(new Date());

  return (
    <div
      className="hidden print:block"
      style={{ fontFamily: "var(--font-itinerary)" }}
    >
      {/* Repeats on every printed page - Chromium tiles `position: fixed`
          elements per page box during print, which is what lets a single
          element act as a page watermark without duplicating it per section.
          Centered on the page box, matching the reference PDF, which paints
          this mark with zero rotation (its image transform matrix is a pure
          scale, angle = atan2(0, 1108.35) = 0deg - not the 15deg this used
          to be rotated by). The reference's own source icon is a padded
          square (the mark inset within empty margin), but our
          snapingo-icon.png is already trimmed tight to the mark - so
          matching the reference's raw image bounding box (1108.35pt ->
          ~815px) on our un-padded asset renders the mark far larger than
          the reference's actual visible ink. Sized down to read as the same
          subtle background mark instead of dominating the page. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden"
        style={{ zIndex: -1 }}
      >
        <img
          src="/snapingo-icon.png"
          alt=""
          className="h-[320px] w-[320px] object-contain opacity-[0.07]"
        />
      </div>

      {/* Mountain range mark, repeating on every printed page like the S
          icon above - measured off the reference PDF the same way: its
          paintImageXObject box is 811.3x540.9pt at (x520, y1044.3) on a
          1080pt-wide page, which scales (x793.7/1080 page-width ratio) to a
          596x398px box bottom-right, bleeding off the right and bottom
          edges by the same proportion the reference does. Sampled pixel
          color where it overlaps plain white background there
          (rgb(253,231,242) against brand-500 #ec1278 on white) solves to
          ~7% alpha - the same opacity already used for the icon mark
          above, not a separate guessed value.
          `bottom` is offset past -43px (the raw page-edge-relative value
          from the measurement above) by the @page margin (1.5cm ≈ 57px,
          see globals.css) - Chromium positions a `fixed` element during
          print relative to the page's margin box, not the physical sheet,
          so without this extra offset the mark renders ~57px above where
          it should bleed off the actual page bottom, verified against a
          real headless-Chrome print-to-pdf render of this component. */}
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-[-100px] right-[-184px] h-[398px] w-[596px] overflow-hidden"
        style={{ zIndex: -1 }}
      >
        <img
          src="/snapingo-mountain-hills.png"
          alt=""
          className="h-full w-full object-contain object-bottom opacity-[0.07]"
        />
      </div>

      <header className="flex items-center justify-between border-b-2 border-brand-600 pb-2">
        {/* Icon + the real wordmark glyph (the brand's own lettering, not a
            web font standing in for it) on one line - see
            scripts/build-horizontal-wordmark.mjs for how
            snapingo-wordmark-horizontal.png was derived from the source
            logo art, matching the reference PDF's header exactly. */}
        <img
          src="/snapingo-wordmark-horizontal.png"
          alt="Snapingo"
          loading="eager"
          className="h-12 w-auto"
        />
        <p className="text-sm font-bold uppercase tracking-wide text-ink-700">
          A unit of SNAP Tour and Travels Pvt. Ltd.
        </p>
      </header>

      <div className="mt-3 flex items-center justify-between border-b border-ink-100 pb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
        <span>Quotation Generated: {quoteDate}</span>
        <span>Package Ref: {pkg.id.toUpperCase()}</span>
      </div>

      <div className="mt-3 flex gap-3 break-inside-avoid">
        {/* Plain <img>, not next/image: this block is display:none until
            print, so a lazy-loaded image would never have started
            fetching by the time the browser captures the print output.
            189x125 (landscape, ~1.51:1) is the reference photo's measured
            frame - the margin freed up elsewhere (removing the orphaned
            Day-by-Day heading, tighter section spacing) covers the extra
            height this needs versus the smaller size tried earlier. */}
        <img
          src={pkg.image}
          alt={pkg.title}
          loading="eager"
          className="h-[125px] w-[189px] shrink-0 rounded-xl border border-ink-200 object-cover"
        />
        <div className="min-w-0 flex-1">
          {pkg.badge && (
            <span className="inline-block rounded-md bg-brand-600 px-3 py-1 text-sm font-bold uppercase tracking-wide text-white">
              {pkg.badge}
            </span>
          )}
          <h1 className="mt-1.5 text-[20px] font-extrabold leading-tight text-ink-900">
            {pkg.title}
          </h1>
          <p className="mt-0.5 text-sm text-ink-600">{pkg.destination}</p>

          {/* A simple box (small corner radius, not a rounded/pill bar) that
              sits inside this text column beside the photo, not spanning
              the full page width - the reference's duration/trip/rating row
              sits entirely within the photo's vertical span (y 200.8-371pt)
              and its text never extends past the title's right edge, so
              it's part of this flex column, not a separate full-width
              block below the image. */}
          <div className="mt-2 flex items-center justify-between gap-3 break-inside-avoid rounded-md bg-brand-600 px-4 py-2">
            <span className="whitespace-nowrap text-[11px] font-bold text-white">
              {pkg.duration}
            </span>
            <span className="whitespace-nowrap text-[11px] font-bold capitalize text-white">
              {pkg.type} Trip
            </span>
            <span className="whitespace-nowrap text-[11px] font-bold text-white">
              {pkg.rating} / 5 ({pkg.reviews.toLocaleString("en-IN")} reviews)
            </span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between break-inside-avoid rounded-xl border border-brand-200 bg-brand-50 px-5 py-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-brand-700">
            Price Per Person
          </p>
          <p className="mt-1">
            <span className="text-[28px] font-extrabold text-brand-600">
              ₹{pkg.price.toLocaleString("en-IN")}
            </span>{" "}
            <span className="text-base text-ink-400 line-through">
              ₹{pkg.originalPrice.toLocaleString("en-IN")}
            </span>
          </p>
        </div>
        <p className="rounded-full bg-brand-600 px-4 py-2 text-sm font-bold text-white">
          {discount}% OFF
        </p>
      </div>

      {nightStays.length > 0 ? (
        <section className="mt-4 break-inside-avoid">
          <h2 className="text-[21px] font-extrabold uppercase tracking-wide text-ink-900">
            Accommodation
          </h2>
          <table className="mt-2 w-full border-collapse border border-brand-200 text-base">
            <thead>
              <tr className="text-left">
                <th className="border border-brand-200 px-3 py-2 text-[22px] font-extrabold text-brand-600">
                  Destination
                </th>
                <th className="border border-brand-200 px-3 py-2 text-[22px] font-extrabold text-brand-600">
                  Hotel
                </th>
                <th className="border border-brand-200 px-3 py-2 text-[22px] font-extrabold text-brand-600">
                  Category
                </th>
              </tr>
            </thead>
            <tbody>
              {nightStays.map((stay) => (
                <tr key={stay.city} className="break-inside-avoid">
                  <td className="border border-brand-200 px-3 py-2 font-semibold text-ink-900">
                    {stay.city} &mdash; {stay.nights} Night{stay.nights === 1 ? "" : "s"}
                  </td>
                  <td className="border border-brand-200 px-3 py-2 font-semibold text-ink-900">
                    {stay.hotel ? stay.hotel.name : `Similar ${stay.categoryLabel.toLowerCase()} property`}
                  </td>
                  <td className="border border-brand-200 px-3 py-2 font-semibold text-ink-900">
                    {stay.categoryLabel}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-1.5 text-base font-bold text-brand-600">
            &bull; Hotels listed above, or similar category properties, confirmed at the time of
            booking.
          </p>
        </section>
      ) : (
        <section className="mt-4 break-inside-avoid rounded-xl border border-brand-200 p-3">
          <h2 className="text-[21px] font-extrabold uppercase tracking-wide text-ink-900">
            Accommodation
          </h2>
          {hotel ? (
            <div className="mt-2">
              <p className="text-base font-extrabold text-ink-900">{hotel.name}</p>
              <p className="mt-1 flex items-center gap-2">
                <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-brand-700">
                  {categoryLabel}
                </span>
              </p>
              <p className="mt-2 text-base font-bold text-brand-600">
                &bull; Or a similar {categoryLabel.toLowerCase()} category property, confirmed at
                the time of booking.
              </p>
            </div>
          ) : (
            <p className="mt-2 text-base font-bold text-brand-600">
              &bull; Handpicked {categoryLabel.toLowerCase()} category hotels/resorts along the
              route, confirmed at the time of booking.
            </p>
          )}
        </section>
      )}

      <section className="mt-4 break-inside-avoid rounded-xl border border-brand-200 p-3">
        <h2 className="text-[21px] font-extrabold uppercase tracking-wide text-ink-900">
          Vehicle / Transport
        </h2>
        <p className="mt-1.5 text-[21px] font-extrabold text-brand-600">{vehicleType}</p>
        <p className="mt-1 whitespace-nowrap text-[15px] text-brand-600">
          Used for all airport/station pickups, drops, transfers and sightseeing listed in the
          itinerary below.
        </p>
      </section>

      <section className="mt-4">
        <h2 className="text-[31px] font-extrabold uppercase tracking-wide text-brand-600">
          Highlights :
        </h2>
        <ul className="mt-2 space-y-1.5 text-base font-semibold text-ink-900">
          {pkg.highlights.map((h) => (
            <li key={h}>
              <span className="text-brand-600">&bull;</span> {h}
            </li>
          ))}
        </ul>
      </section>

      {/* break-after-avoid on the heading box (not break-inside-avoid on
          the whole section) - glues the heading to whatever day content
          follows so it's never stranded alone at a page bottom, without
          forcing the entire day list to jump together as one block when it
          doesn't fit the room left on the page (which was leaving large
          blank gaps). Each day block below already carries its own
          break-inside-avoid. */}
      <section className="mt-8">
        <div className="mx-auto w-fit break-inside-avoid break-after-avoid rounded-xl border border-brand-300 px-8 py-3">
          <h2 className="text-4xl font-extrabold uppercase tracking-wide text-brand-600">
            Day-by-Day Itinerary
          </h2>
        </div>
        <div className="mt-5 space-y-4">
          {pkg.itinerary.map((day) => (
            <div key={day.day} className="break-inside-avoid">
              <span className="inline-block rounded-md bg-brand-600 px-3 py-1.5 text-[21px] font-bold text-white">
                Day {day.day} : {day.title}
              </span>
              <p className="mt-1.5 text-[19px] leading-relaxed text-ink-800">{day.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Flexbox, not CSS grid - Chromium's print pagination has a known bug
          with grid containers near a page boundary: it can leave a stray
          "ghost" fragment of a column's border behind on the page above
          the one the grid actually ends up printing on. Flex fragments
          cleanly here since both columns are already fully protected by
          break-inside-avoid on the containing div. */}
      <div className="mt-6 flex gap-4 break-inside-avoid">
        <section className="flex-1 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <h2 className="text-[21px] font-extrabold uppercase tracking-wide text-emerald-800">
            Inclusion
          </h2>
          <ul className="mt-2 space-y-1 text-[19px] text-ink-800">
            {pkg.inclusions.map((inc) => (
              <li key={inc} className="break-inside-avoid">&bull; {inclusionLabels[inc]}</li>
            ))}
          </ul>
        </section>
        <section className="flex-1 rounded-xl border border-rose-200 bg-rose-50 p-4">
          <h2 className="text-[21px] font-extrabold uppercase tracking-wide text-rose-700">
            Exclusions
          </h2>
          <ul className="mt-2 space-y-1 text-[19px] text-ink-800">
            {pkg.exclusions.map((ex) => (
              <li key={ex} className="break-inside-avoid">&bull; {ex}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-6">
        <SectionHeading>About Snapingo</SectionHeading>
        <p className="mt-2 text-[19px] leading-relaxed text-ink-800">
          Snapingo Travel was built to give the modern traveller flexibility and a genuine sense
          of independence in planning a trip. We curate all-inclusive holiday packages, flights,
          stay, transfers and sightseeing, bundled into a single booking, backed by an in-house
          team that stays reachable through the whole journey, not just at the time of booking.
        </p>
      </section>

      <section className="mt-6">
        <SectionHeading>Terms &amp; Conditions</SectionHeading>
        <ul className="mt-2 space-y-1 text-[19px] text-ink-800">
          <li className="break-inside-avoid">&bull; Packages can be customized, except Fixed Departure tours which follow a pre-set itinerary.</li>
          <li className="break-inside-avoid">&bull; All change requests must be communicated to Snapingo Travel in writing.</li>
          <li className="break-inside-avoid">&bull; Services are provided strictly as detailed in the official Booking Confirmation.</li>
          <li className="break-inside-avoid">&bull; Snapingo Travel is not liable for delays or cancellations caused by natural calamities, strikes, political unrest, or other unforeseen events.</li>
          <li className="break-inside-avoid">&bull; Jurisdiction: legal disputes are subject to competent courts in Uttar Pradesh / Delhi NCR.</li>
        </ul>
      </section>

      {/* break-inside-avoid (not break-before-page): Payment Policy's bullet
          list is short enough to jump to the next page as one whole block
          if it doesn't fit the room left on the current one, the same way
          Accommodation/Vehicle-Transport above do - forcing it onto its own
          page regardless of how much room was actually left was what
          stranded a large blank gap under Terms & Conditions. */}
      <section className="mt-6 break-inside-avoid">
        <SectionHeading>Payment Policy</SectionHeading>
        <ul className="mt-2 space-y-1 text-[19px] text-ink-800">
          <li className="break-inside-avoid">&bull; Standard packages: 75% advance at booking, 25% on arrival.</li>
          <li className="break-inside-avoid">&bull; Himachal packages: 50% advance, 50% on arrival.</li>
          <li className="break-inside-avoid">&bull; 4-star / 5-star &amp; luxury packages: 100% advance required.</li>
          <li className="break-inside-avoid">&bull; Accepted modes: Bank Transfer (NEFT/RTGS/IMPS), UPI, Cheque.</li>
        </ul>
      </section>

      <section className="mt-6">
        <SectionHeading>Cancellation Policy</SectionHeading>
        <ul className="mt-2 space-y-1 text-[19px] text-ink-800">
          <li className="break-inside-avoid">&bull; Token / advance payment is non-refundable in all cases.</li>
          <li className="break-inside-avoid">&bull; 15+ days before departure: 25% to 50% cancellation fee.</li>
          <li className="break-inside-avoid">&bull; Within 15 days, or a no-show: 100% retention, no refund.</li>
          <li className="break-inside-avoid">&bull; No refunds for unused flights, hotels, meals or sightseeing.</li>
        </ul>
      </section>

      <section className="mt-6 break-inside-avoid rounded-xl border border-brand-200 bg-brand-50 p-4">
        <h2 className="text-[17px] font-extrabold uppercase tracking-wide text-brand-700">
          Need Help?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-800">
          Talk to a travel expert to confirm dates, customize this itinerary or complete your
          booking.
        </p>
        <p className="mt-2 text-sm font-bold text-ink-900">
          WhatsApp / Call: {siteConfig.phone}
        </p>
        <p className="mt-1 text-sm text-ink-800">Email: {siteConfig.email}</p>
      </section>

      <div className="relative">
        <div className="mt-6 flex flex-wrap items-center gap-6 break-inside-avoid">
          <div className="flex min-w-[300px] items-center gap-3 rounded-xl border border-brand-200 px-5 py-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-600 text-white">
              <User className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-bold uppercase tracking-wide text-brand-600">
                Operation Head
              </p>
              <p className="text-[27px] font-extrabold text-ink-900">
                {operationHead.name}
              </p>
            </div>
          </div>
          <ul className="space-y-1 text-[17px] text-ink-800">
            <li className="break-inside-avoid">&bull; Operation Head | Snapingo</li>
            <li className="break-inside-avoid">&bull; {operationHead.phone}</li>
            <li className="break-inside-avoid">&bull; {operationHead.email}</li>
            <li className="break-inside-avoid">&bull; {siteConfig.url.replace(/^https?:\/\//, "")}</li>
          </ul>
        </div>

        <footer className="mt-8 break-inside-avoid border-t border-ink-200 pt-3 text-[17px] text-ink-500">
          <p className="text-xl font-semibold text-ink-700">SNAPINGO TRAVELS</p>
          <p className="mt-1">
            {siteConfig.address.street}, {siteConfig.address.locality}, {siteConfig.address.region}{" "}
            {siteConfig.address.postalCode}
          </p>
          <p className="mt-1">
            {siteConfig.phone} &middot; {siteConfig.email} &middot; {siteConfig.url.replace(/^https?:\/\//, "")}
          </p>
          <p className="mt-2">
            Hotel, room category and vehicle details above are indicative and subject to
            availability at the time of booking; a specific property and vehicle will be
            confirmed in your Booking Confirmation. Prices are per person, starting from. This
            itinerary is indicative: contact us to confirm final dates and inclusions.
          </p>
        </footer>
      </div>
    </div>
  );
}
