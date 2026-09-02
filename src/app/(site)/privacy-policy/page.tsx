import type { Metadata } from "next";
import LegalHero from "@/components/legal/LegalHero";
import LegalToc from "@/components/legal/LegalToc";
import LegalSection from "@/components/legal/LegalSection";
import LegalList from "@/components/legal/LegalList";

export const metadata: Metadata = {
  title: "Privacy Policy | Snapingo",
  description:
    "How Snapingo collects, uses, stores, and protects your personal data when you use our travel booking and concierge services.",
  alternates: { canonical: "/privacy-policy" },
};

const toc = [
  { id: "collect", label: "1. Information We Collect" },
  { id: "use", label: "2. How We Use Your Information" },
  { id: "sharing", label: "3. Information Sharing" },
  { id: "security", label: "4. Data Storage & Security" },
  { id: "cookies", label: "5. Cookies & Tracking" },
  { id: "rights", label: "6. Your Privacy Rights" },
  { id: "children", label: "7. Children's Privacy" },
  { id: "updates", label: "8. Policy Updates" },
];

export default function PrivacyPolicyPage() {
  return (
    <>
      <LegalHero title="Privacy Policy & Data Protection" />

      <section className="pb-16 pt-6 sm:pb-20 sm:pt-8">
        <div className="container-app grid grid-cols-1 gap-12 lg:grid-cols-[220px_1fr]">
          <LegalToc items={toc} />

          <div className="max-w-3xl">
            <LegalSection id="collect" number="1" title="Information We Collect">
              <p>
                To facilitate travel package reservations, flight bookings, hotel accommodations,
                and customized itinerary planning, Snapingo collects the following categories of
                information:
              </p>

              <div>
                <h3 className="font-heading text-base font-bold text-ink-900">
                  A. Personal Identification Data
                </h3>
                <div className="mt-2">
                  <LegalList
                    items={[
                      {
                        label: "Contact Information",
                        text: "Full legal name, email address, mobile phone number, and physical billing address.",
                      },
                      {
                        label: "Traveler Profile & Travel Documents",
                        text: "Date of birth, gender, government identification details, and passport information (passport number, issue/expiry dates, nationality) required for international ticketing and visa advisories.",
                      },
                      {
                        label: "Custom Inquiry Data",
                        text: 'Travel dates, destination preferences, traveler counts, meal preferences, and budget specifications submitted via the "Plan My Trip" concierge form.',
                      },
                    ]}
                  />
                </div>
              </div>

              <div>
                <h3 className="font-heading text-base font-bold text-ink-900">
                  B. Transactional & Financial Data
                </h3>
                <p className="mt-2">
                  Payment records, order reference IDs, transaction timestamps, and invoice
                  histories.
                </p>
                <p className="mt-2 text-sm italic text-ink-700">
                  Note: We do not store full credit/debit card numbers or CVV codes on our
                  servers. All financial transactions are processed securely via PCI-DSS Level 1
                  certified payment gateways.
                </p>
              </div>

              <div>
                <h3 className="font-heading text-base font-bold text-ink-900">
                  C. Technical, Device & Usage Information
                </h3>
                <p className="mt-2">
                  IP address, geolocation (country/city), browser type, operating system, referral
                  URLs, page interaction timestamps, and device identifiers collected via cookies
                  and edge routing.
                </p>
              </div>
            </LegalSection>

            <LegalSection id="use" number="2" title="Legal Basis & How We Use Your Information">
              <p>
                Snapingo processes your personal data strictly for legitimate business operations
                and travel service execution:
              </p>
              <LegalList
                items={[
                  {
                    label: "Fulfilling Bookings & Reservations",
                    text: "Communicating passenger itineraries to airlines (e.g., IndiGo, Air India, Emirates), hotels (e.g., Taj, Marriott, ITC), and ground transport operators.",
                  },
                  {
                    label: "Concierge & Customer Support",
                    text: 'Processing "Plan My Trip" inquiries, assigning dedicated travel experts, sending automated WhatsApp/SMS booking confirmations, and delivering flight vouchers.',
                  },
                  {
                    label: "Financing & EMI Facilitation",
                    text: "Coordinating Zero-Cost EMI eligibility checks through approved partner banking institutions.",
                  },
                  {
                    label: "Service Personalization & Promotions",
                    text: "Displaying geo-targeted promotional discounts, local support hotlines, and travel advisories.",
                  },
                  {
                    label: "Legal Compliance & Safety",
                    text: "Complying with aviation mandates, tax compliance regulations (GST / TCS reporting), and fraud prevention protocols.",
                  },
                ]}
              />
            </LegalSection>

            <LegalSection id="sharing" number="3" title="Information Sharing & Third-Party Disclosures">
              <p>
                We do not sell, trade, or rent your personal information to third-party
                advertisers. Your information is shared only under strict data-protection
                agreements with:
              </p>
              <LegalList
                items={[
                  {
                    label: "Airlines & Hospitality Suppliers",
                    text: "Verified airline carriers, hotel partners, and local ground transfer operators solely for booking fulfillment and passenger manifest compliance.",
                  },
                  {
                    label: "Payment Gateways & Financial Partners",
                    text: "Authorized payment processors (e.g., Razorpay, Stripe, Easebuzz) and banking institutions providing Zero-Cost EMI subventions.",
                  },
                  {
                    label: "Concierge & Communication Tools",
                    text: "Enterprise communication APIs (WhatsApp Business API, Twilio, SendGrid) and customer relationship management (CRM) systems to deliver timely travel notifications.",
                  },
                  {
                    label: "Regulatory & Legal Authorities",
                    text: "Government bodies, customs, immigration, and law enforcement agencies when mandated by statutory requirements.",
                  },
                ]}
              />
            </LegalSection>

            <LegalSection id="security" number="4" title="Data Storage, Security & Encryption Protocols">
              <LegalList
                items={[
                  {
                    label: "Encryption",
                    text: "All data transmitted between your browser and Snapingo is encrypted using Transport Layer Security (TLS 1.3). Sensitive records and identity documents are encrypted at rest using AES-256 standards.",
                  },
                  {
                    label: "Access Control",
                    text: "Strict role-based access control (RBAC) ensures only authorized concierge personnel and operational agents access booking files.",
                  },
                  {
                    label: "Data Retention",
                    text: "Personal booking data is retained for the duration required to service your travel, handle tax and accounting compliance, and resolve potential post-travel claims, after which it is securely purged or anonymized.",
                  },
                ]}
              />
            </LegalSection>

            <LegalSection id="cookies" number="5" title="Cookies & Tracking Technologies">
              <p>
                Snapingo utilizes essential, analytical, and functional cookies to ensure
                responsive site performance, remember user currency and trip preferences, and
                evaluate website traffic patterns. You can manage or disable non-essential cookies
                through your browser settings without impacting core browsing functionality.
              </p>
            </LegalSection>

            <LegalSection id="rights" number="6" title="Your Privacy Rights">
              <p>
                Depending on your jurisdiction, you possess the following statutory rights
                regarding your personal data:
              </p>
              <LegalList
                items={[
                  {
                    label: "Right to Access & Portability",
                    text: "Request a copy of the personal information Snapingo maintains regarding your profile.",
                  },
                  {
                    label: "Right to Rectification",
                    text: "Request correction of incomplete, inaccurate, or outdated traveler details.",
                  },
                  {
                    label: "Right to Erasure",
                    text: "Request the deletion of your personal data, subject to statutory record-retention requirements under taxation and aviation laws.",
                  },
                  {
                    label: "Right to Withdraw Consent",
                    text: "Opt-out of marketing communications and promotional newsletters at any time via one-click unsubscribe links.",
                  },
                ]}
              />
            </LegalSection>

            <LegalSection id="children" number="7" title="Children's Privacy">
              <p>
                Snapingo does not knowingly collect personal information directly from individuals
                under 18 years of age without verifiable parental or legal guardian consent. Minor
                traveler details required for flight ticketing and hotel family occupancy must be
                provided directly by an adult guardian.
              </p>
            </LegalSection>

            <LegalSection id="updates" number="8" title="Policy Updates">
              <p>
                Snapingo reserves the right to amend this Privacy Policy periodically to reflect
                technological improvements, regulatory updates, or changes in operational
                practices. Any material modifications will be reflected with an updated
                &ldquo;Effective Date&rdquo; at the top of this document.
              </p>
            </LegalSection>
          </div>
        </div>
      </section>
    </>
  );
}
