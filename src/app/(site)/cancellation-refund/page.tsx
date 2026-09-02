import type { Metadata } from "next";
import LegalHero from "@/components/legal/LegalHero";
import LegalToc from "@/components/legal/LegalToc";
import LegalSection from "@/components/legal/LegalSection";
import LegalList from "@/components/legal/LegalList";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy | Snapingo",
  description:
    "Snapingo's cancellation, rescheduling and refund policy for holiday packages, flights, hotels and cab bookings.",
  alternates: { canonical: "/cancellation-refund" },
};

const toc = [
  { id: "overview", label: "1. Overview" },
  { id: "timeline", label: "2. Cancellation Timeline" },
  { id: "how-to-cancel", label: "3. How to Cancel or Reschedule" },
  { id: "refunds", label: "4. Refund Processing" },
  { id: "taxes", label: "5. Taxes & Statutory Charges" },
  { id: "force-majeure", label: "6. Force Majeure" },
];

export default function CancellationRefundPage() {
  return (
    <>
      <LegalHero title="Cancellation & Refund Policy" />

      <section className="pb-16 pt-6 sm:pb-20 sm:pt-8">
        <div className="container-app grid grid-cols-1 gap-12 lg:grid-cols-[220px_1fr]">
          <LegalToc items={toc} />

          <div className="max-w-3xl">
            <LegalSection id="overview" number="1" title="Overview">
              <p>
                This policy applies to holiday packages, flight bookings, hotel accommodations,
                and cab/transfer services booked through Snapingo, whether reserved directly on{" "}
                <span className="font-semibold">snapingo.vercel.app</span> or via our &ldquo;Plan
                My Trip&rdquo; concierge desk. Because Snapingo books through airline, hotel, and
                ground-transport partners, cancellation and refund outcomes ultimately follow the
                fare rules and policies of the respective supplier, in addition to the terms
                below.
              </p>
            </LegalSection>

            <LegalSection id="timeline" number="2" title="Standard Package Cancellation Timeline">
              <LegalList
                items={[
                  {
                    label: "Token / Advance Payment",
                    text: "Non-refundable in all cases, regardless of how far in advance the cancellation is made.",
                  },
                  {
                    label: "15+ Days Prior to Departure",
                    text: "A cancellation fee of 25% to 50% of the total package value applies, depending on the package and supplier terms.",
                  },
                  {
                    label: "Within 15 Days of Departure, or No-Show",
                    text: "100% retention charges apply and the booking becomes fully non-refundable.",
                  },
                  {
                    label: "Unused Services",
                    text: "No refunds are issued for services already confirmed but not used, including flights, hotels, meals, or sightseeing.",
                  },
                  {
                    label: "Flight Tickets & Non-Refundable Hotels",
                    text: "Any airline ticket issued under non-refundable fare buckets or promotional flash deals is subject strictly to the airline's own cancellation policy, irrespective of the timelines above.",
                  },
                ]}
              />
              <p>
                This timeline is calculated from the date we receive your written cancellation
                request (email or WhatsApp) to the scheduled date of departure, not the date of
                original booking. All cancellations must be submitted in writing.
              </p>
            </LegalSection>

            <LegalSection id="how-to-cancel" number="3" title="How to Cancel or Reschedule">
              <p>
                To cancel or reschedule a confirmed booking, reach out to your assigned travel
                expert or our support desk via phone, email, or WhatsApp with your booking
                reference number. Rescheduling requests (change of travel dates) are treated as a
                cancellation of the original booking followed by a fresh reservation, and are
                subject to airline/hotel availability at the new dates, any fare difference, and
                the applicable cancellation charges above.
              </p>
            </LegalSection>

            <LegalSection id="refunds" number="4" title="Refund Processing">
              <p>
                Approved refunds are credited back to the original payment method used at the
                time of booking, within 7 to 14 business days from the date the respective
                supplier (airline, hotel, or transport partner) confirms receipt and processing of
                the cancellation. Bookings paid via Zero-Cost EMI are refunded to the partner
                bank, which may apply its own timeline for reversing any interest or processing
                charges already levied.
              </p>
            </LegalSection>

            <LegalSection id="taxes" number="5" title="Taxes & Statutory Charges">
              <p>
                Goods and Services Tax (GST) and Tax Collected at Source (TCS) already remitted to
                government authorities on a confirmed booking are non-refundable, in line with
                applicable Indian tax regulations, even where the underlying package amount is
                refunded.
              </p>
            </LegalSection>

            <LegalSection id="force-majeure" number="6" title="Force Majeure & Exceptional Circumstances">
              <p>
                In situations arising from Force Majeure, natural calamities, government
                lockdowns, or pandemic-related travel restrictions, cancellation and refund
                timelines may vary from the standard policy above, depending on the terms offered
                by our airline, hotel, and transport partners at the time. See our{" "}
                <a href="/terms-of-service#liability" className="font-semibold text-brand-600 hover:underline">
                  Terms of Service
                </a>{" "}
                for how Snapingo handles Force Majeure events.
              </p>
            </LegalSection>
          </div>
        </div>
      </section>
    </>
  );
}
