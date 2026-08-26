// Central place for site-wide SEO/metadata facts. Reads NEXT_PUBLIC_SITE_URL
// so the real production domain can be set via an environment variable at
// deploy time without touching code; falls back to the domain already
// referenced in the itinerary PDF footer and legal pages.
export const siteConfig = {
  name: "Snapingo",
  legalName: "SNAP Tour and Travels Pvt. Ltd.",
  // Required on any invoice that charges GST - set the real 15-character
  // GSTIN via this env var once registered. Falls back to a clearly-marked
  // placeholder so an unregistered business doesn't accidentally ship a
  // blank/fake-looking field, and InvoiceView hides the line entirely if
  // this stays unset.
  gstin: process.env.NEXT_PUBLIC_GSTIN ?? null,
  title: "Snapingo | Book Domestic & International Tour Packages",
  description:
    "Snapingo curates all-inclusive holiday packages, including flights, stay, transfers & sightseeing, for domestic and international destinations. Plan your perfect trip with Snapingo.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.snapingo.com").replace(/\/$/, ""),
  phone: "+91 87003 68575",
  phoneHref: "+918700368575",
  email: "info@snapingo.com",
  address: {
    street: "NX One, Plot No. 17, Tech Zone 4",
    locality: "Greater Noida West",
    region: "UP",
    postalCode: "201318",
    country: "IN",
  },
  social: {
    instagram: "https://www.instagram.com/snapingo.travel?utm_source=qr&igsh=NHJ2YjZrN3phcGgw",
    facebook: "https://www.facebook.com/share/1SeCwwiBoX/",
    linkedin: "https://www.linkedin.com/company/snapingo/",
    youtube: "https://www.youtube.com/@Snapingo.travel",
  },
  // Used as the fallback Open Graph / Twitter card image for pages that
  // don't have a more specific photo of their own (e.g. About, Contact,
  // FAQ) - a real Unsplash travel photo rather than the square logo, since
  // OG previews render as a wide 1200x630 banner.
  defaultOgImage: "/images/unsplash/1573843981267-be1999ff37cd.jpg",
} as const;
