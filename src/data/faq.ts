export type FaqItem = {
  question: string;
  answer: string;
};

export type FaqCategory = {
  category: string;
  items: FaqItem[];
};

export const faqs: FaqCategory[] = [
  {
    category: "Booking & Packages",
    items: [
      {
        question: "What's included in a Snapingo holiday package?",
        answer:
          "Our packages are all-inclusive by default: flights, hotel stay, airport & local transfers, meals as per the itinerary, and guided sightseeing, bundled into a single booking. Each package page lists exactly what's included and excluded before you book.",
      },
      {
        question: "Can I customize a package to my dates, hotel category, or budget?",
        answer:
          "Yes. Every package is a starting template, not a fixed itinerary. Reach out via WhatsApp, call, or our \"Plan My Trip\" concierge desk with your dates and preferences, and a travel expert will requote it for you.",
      },
      {
        question: "Are the prices shown on the website final?",
        answer:
          "Listed prices are per person, starting from, and reflect current availability and season. Because pricing depends on real-time flight and hotel availability, the final quote is confirmed only once you speak to a travel expert and the booking is paid for.",
      },
      {
        question: "How do I actually book a package?",
        answer:
          "Tap \"Plan This Trip\" or message us on WhatsApp from any package or destination page with the package name and your travel dates. A travel expert will confirm availability, share the final quote, and take it from there.",
      },
    ],
  },
  {
    category: "Payments",
    items: [
      {
        question: "What payment options do you offer?",
        answer:
          "Standard online payment, plus Zero-Cost EMI through our partner banks and payment gateways. EMI approval, credit limits, and interest subvention are at the discretion of the partner bank, not Snapingo.",
      },
      {
        question: "How much advance payment do I need to pay?",
        answer:
          "Most packages require 75% advance at booking, with the remaining 25% payable on arrival. Himachal packages need 50% advance. 4-star/5-star hotel and luxury packages require full payment upfront. We accept Bank Transfer (NEFT/RTGS/IMPS), UPI, and Cheque.",
      },
      {
        question: "Are GST and other taxes included in the price I see?",
        answer:
          "Package prices are subject to applicable GST and, for international packages, Tax Collected at Source (TCS) as mandated by the Government of India. These are shown separately at the time of final quotation.",
      },
      {
        question: "Can I combine multiple discount codes on one booking?",
        answer: "No - only one promotional coupon or discount code can be redeemed per booking.",
      },
    ],
  },
  {
    category: "Cancellation & Refunds",
    items: [
      {
        question: "What's the cancellation policy if my plans change?",
        answer:
          "The token/advance payment is non-refundable in all cases. Cancelling 15+ days before departure attracts a 25% to 50% fee; inside 15 days, or a no-show, forfeits the full amount. Flights on non-refundable fares follow the airline's own policy regardless of this timeline. Full details are on our Cancellation & Refund Policy page.",
      },
      {
        question: "How long does a refund take to reach me?",
        answer:
          "Once a cancellation is approved, refunds are credited to your original payment method within 7 to 14 business days from when the airline/hotel/transport partner confirms the cancellation.",
      },
    ],
  },
  {
    category: "Documents & International Travel",
    items: [
      {
        question: "Do I need a visa for international packages?",
        answer:
          "For most international destinations, yes. Snapingo offers visa facilitation guidance as an advisory service, but the traveler is responsible for securing the required visa, and the final grant of entry rests solely with the destination country's immigration authorities.",
      },
      {
        question: "What are the passport requirements?",
        answer:
          "Your passport should be valid for at least 6 months beyond your planned date of return for any international trip - this is a standard requirement across airlines and immigration checkpoints, not just ours.",
      },
    ],
  },
  {
    category: "Support",
    items: [
      {
        question: "Is there support available during my trip, not just before booking?",
        answer:
          "Yes, 24/7 trip support over WhatsApp and phone for the duration of your trip - the same team stays reachable after you've paid, not only at the booking stage.",
      },
      {
        question: "What happens if my flight is delayed or cancelled by the airline?",
        answer:
          "Flight delays, schedule changes, and cancellations are governed by the airline's own policy, and Snapingo isn't able to override them. That said, message us as soon as it happens - we'll help you sort out rebooking, hotel, or transfer adjustments with the respective supplier.",
      },
    ],
  },
];
