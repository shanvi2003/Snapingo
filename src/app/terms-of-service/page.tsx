import type { Metadata } from "next";
import LegalHero from "@/components/legal/LegalHero";
import LegalToc from "@/components/legal/LegalToc";
import LegalSection from "@/components/legal/LegalSection";
import LegalList from "@/components/legal/LegalList";

export const metadata: Metadata = {
  title: "Terms of Service | Snapingo",
  description:
    "The terms and conditions that govern your use of Snapingo's travel booking and concierge services.",
};

const toc = [
  { id: "introduction", label: "1. Introduction & Acceptance" },
  { id: "scope", label: "2. Scope of Services" },
  { id: "accounts", label: "3. User Accounts & Accuracy" },
  { id: "pricing", label: "4. Pricing, Taxes & EMI" },
  { id: "cancellation", label: "5. Cancellation & Refunds" },
  { id: "documentation", label: "6. Passports & Visas" },
  { id: "promotions", label: "7. Promotional Codes" },
  { id: "liability", label: "8. Limitation of Liability" },
  { id: "ip", label: "9. Intellectual Property" },
  { id: "law", label: "10. Governing Law" },
];

export default function TermsOfServicePage() {
  return (
    <>
      <LegalHero title="Terms of Service & User Agreement" />

      <section className="pb-16 pt-6 sm:pb-20 sm:pt-8">
        <div className="container-app grid grid-cols-1 gap-12 lg:grid-cols-[220px_1fr]">
          <LegalToc items={toc} />

          <div className="max-w-3xl">
            <LegalSection id="introduction" number="1" title="Introduction & Acceptance of Terms">
              <p>
                These Terms of Service (&ldquo;Agreement&rdquo;, &ldquo;Terms&rdquo;) constitute a
                legally binding agreement between you (&ldquo;User&rdquo;, &ldquo;Traveler&rdquo;,
                &ldquo;Customer&rdquo;) and Snapingo (&ldquo;Company&rdquo;, &ldquo;We&rdquo;,
                &ldquo;Us&rdquo;, &ldquo;Our&rdquo;), governing your use of our website, holiday
                package booking engines, custom concierge services, and customer assistance desks.
              </p>
              <p>
                If you do not accept or agree with any part of these Terms, you must discontinue
                using our website and services immediately. Continued use of the platform
                represents an unconditional acceptance of these Terms.
              </p>
            </LegalSection>

            <LegalSection id="scope" number="2" title="Scope of Services & Role as an Aggregator">
              <p>
                Snapingo is a full-service travel marketplace and concierge that curates, bundles,
                and organizes comprehensive travel packages comprising:
              </p>
              <LegalList
                items={[
                  {
                    label: "Flight Bookings",
                    text: "Arranged via licensed scheduled airline partners (including IndiGo, Air India, Vistara, Emirates, Qatar Airways, Singapore Airlines, and others).",
                  },
                  {
                    label: "Hotel Accommodations",
                    text: "Booked through accredited hotel chains and hospitality partners (including Taj Hotels, Marriott, ITC Hotels, and independent verified resorts).",
                  },
                  {
                    label: "Ground Transfers & Sightseeing",
                    text: "Private cabs, shared shuttles, guided excursions, and adventure activity admissions.",
                  },
                  {
                    label: 'Custom "Plan My Trip" Concierge',
                    text: "Bespoke itinerary planning and quotation support via our travel desks.",
                  },
                ]}
              />
              <p>
                <span className="font-bold text-ink-900">Third-Party Supplier Disclaimers: </span>
                Snapingo acts as an intermediary connecting travelers with certified airlines,
                hotels, and local ground operators. While we curate verified partners, each
                independent provider enforces their respective fare rules, check-in policies,
                baggage limits, and service warranties.
              </p>
            </LegalSection>

            <LegalSection id="accounts" number="3" title="User Account, Booking Inquiries & Information Accuracy">
              <LegalList
                items={[
                  {
                    label: "Eligibility",
                    text: "You must be at least 18 years old and possess the legal authority to enter into binding agreements.",
                  },
                  {
                    label: "Accuracy of Details",
                    text: "You are responsible for ensuring that all traveler names, passport numbers, birth dates, and contact information entered during quotation or booking strictly match government-issued identification. Snapingo is not liable for boarding denials or fee penalties arising from erroneous passenger information.",
                  },
                  {
                    label: "Anti-Spam & Fair Use",
                    text: 'Automated scraping, bot submissions, fraudulent inquiries, and abuse of lead submission forms ("Plan My Trip") are strictly prohibited.',
                  },
                ]}
              />
            </LegalSection>

            <LegalSection id="pricing" number="4" title="Pricing, Taxes, Zero-Cost EMI & Payments">
              <div>
                <h3 className="font-heading text-base font-bold text-ink-900">
                  4.1 Pricing Structure & Currency
                </h3>
                <p className="mt-2">
                  All prices displayed on the website are in Indian National Rupees (INR / ₹)
                  unless explicitly stated otherwise. Package pricing is subject to dynamic
                  availability and seasonal demand until a formal booking confirmation and payment
                  capture occur.
                </p>
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-ink-900">
                  4.2 Zero-Cost EMI & Bank Financing Schemes
                </h3>
                <p className="mt-2">
                  Zero-cost EMI and installment financing are extended in partnership with
                  approved third-party financial institutions and payment gateways. Approval,
                  credit limits, and subvention discounts remain at the sole discretion of the
                  partner bank.
                </p>
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-ink-900">4.3 Applicable Taxes</h3>
                <p className="mt-2">
                  Prices are subject to applicable Goods and Services Tax (GST) and Tax Collected
                  at Source (TCS) as mandated by the Government of India under foreign travel
                  regulations.
                </p>
              </div>
              <div>
                <h3 className="font-heading text-base font-bold text-ink-900">4.4 Advance Payment Schedule</h3>
                <LegalList
                  items={[
                    {
                      label: "Standard Packages",
                      text: "75% advance payment required at the time of booking; the remaining 25% is payable on arrival on Day 1.",
                    },
                    {
                      label: "Himachal Packages",
                      text: "50% advance payment required at booking; the remaining 50% is payable on arrival.",
                    },
                    {
                      label: "4-Star / 5-Star Hotels & Luxury Packages",
                      text: "100% advance payment required for confirmation.",
                    },
                    {
                      label: "Accepted Payment Methods",
                      text: "Bank Transfer (NEFT / RTGS / IMPS), UPI, and Cheque.",
                    },
                  ]}
                />
              </div>
            </LegalSection>

            <LegalSection id="cancellation" number="5" title="Cancellation, Rescheduling & Refund Policy">
              <h3 className="font-heading text-base font-bold text-ink-900">
                Standard Package Cancellation Timeline
              </h3>
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
                    text: "Any airline ticket issued under non-refundable fare buckets or promotional flash deals is subject strictly to airline policy rules.",
                  },
                ]}
              />
              <p>
                <span className="font-bold text-ink-900">Refund Processing SLA: </span>
                Approved refunds will be credited back to the original payment method within 7 to
                14 business days from supplier receipt confirmation. All cancellation requests
                must be submitted in writing.
              </p>
            </LegalSection>

            <LegalSection id="documentation" number="6" title="Passports, Visas & Travel Documentation">
              <p>
                For all international tour packages (e.g., Maldives, Dubai, Bali, Europe,
                Southeast Asia), the traveler is solely responsible for ensuring:
              </p>
              <LegalList
                items={[
                  { text: "Passports maintain a minimum validity of six (6) months beyond the planned date of return." },
                  { text: "Mandatory tourist visas, transit visas, travel insurance certificates, and health/vaccination declarations are secured prior to departure." },
                  { text: "Snapingo provides visa facilitation guidance as an advisory service; final visa grants and entry approvals remain under the sole sovereign discretion of foreign immigration authorities." },
                ]}
              />
            </LegalSection>

            <LegalSection id="promotions" number="7" title="Promotional Codes, Vouchers & Discounts">
              <p>
                Promotions (such as &ldquo;Flat 20% OFF on International Packages&rdquo; or
                &ldquo;Free Hotel Upgrades on Bookings above ₹25,000&rdquo;) are subject to limited
                availability, specific validity windows, and minimum spend thresholds. Only one
                promotional coupon may be redeemed per booking. Snapingo reserves the right to
                modify or revoke promotional campaigns at its discretion.
              </p>
            </LegalSection>

            <LegalSection id="liability" number="8" title="Limitation of Liability & Force Majeure">
              <p>Snapingo, its directors, and affiliates shall not be held liable for:</p>
              <LegalList
                items={[
                  { text: "Flight delays, cancellations, schedule alterations, or baggage mishandling by airlines." },
                  { text: "Acts of God, natural calamities, bad weather, civil unrest, strikes, government lockdowns, or pandemic travel restrictions (Force Majeure)." },
                  { text: "Personal injury, illness, property loss, or unauthorized itinerary deviations during excursions managed by local ground handlers." },
                ]}
              />
            </LegalSection>

            <LegalSection id="ip" number="9" title="Intellectual Property & Brand Assets">
              <p>
                All content on snapingo.vercel.app, including logos, design trademarks, software
                code, custom itineraries, visual assets, and marketing materials, is the exclusive
                intellectual property of Snapingo and protected by applicable copyright and
                trademark laws.
              </p>
            </LegalSection>

            <LegalSection id="law" number="10" title="Governing Law & Dispute Resolution">
              <p>
                These Terms are governed by and construed in accordance with the laws of the
                Republic of India. Any disputes, claims, or controversies arising out of or
                relating to your use of Snapingo services shall be subject to the exclusive
                jurisdiction of the competent courts in Delhi / NCR, India.
              </p>
            </LegalSection>
          </div>
        </div>
      </section>
    </>
  );
}
