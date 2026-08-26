import { siteConfig } from "@/lib/siteConfig";

// Renders a JSON-LD <script> tag. dangerouslySetInnerHTML is the documented
// Next.js pattern for this (App Router has no built-in JSON-LD helper) -
// the value is always JSON.stringify'd structured data we constructed
// ourselves from our own typed data, never raw user input, so this is safe.
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: siteConfig.url,
    logo: `${siteConfig.url}/snapingo-logo.png`,
    image: siteConfig.defaultOgImage,
    telephone: siteConfig.phoneHref,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.address.street,
      addressLocality: siteConfig.address.locality,
      addressRegion: siteConfig.address.region,
      postalCode: siteConfig.address.postalCode,
      addressCountry: siteConfig.address.country,
    },
    sameAs: Object.values(siteConfig.social),
  };
}

export function breadcrumbJsonLd(items: { label: string; href?: string }[]) {
  const withHome = [{ label: "Home", href: "/" }, ...items];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: withHome.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${siteConfig.url}${item.href}` } : {}),
    })),
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}

export function tripPackageJsonLd(pkg: {
  id: string;
  title: string;
  destination: string;
  image: string;
  price: number;
  rating: number;
  reviews: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: pkg.title,
    description: `${pkg.title} - a holiday package to ${pkg.destination} by Snapingo.`,
    image: pkg.image,
    url: `${siteConfig.url}/packages/${pkg.id}`,
    provider: {
      "@type": "TravelAgency",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    offers: {
      "@type": "Offer",
      price: pkg.price,
      priceCurrency: "INR",
      availability: "https://schema.org/InStock",
      url: `${siteConfig.url}/packages/${pkg.id}`,
    },
    aggregateRating:
      pkg.reviews > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: pkg.rating,
            reviewCount: pkg.reviews,
          }
        : undefined,
  };
}

export function articleJsonLd(post: {
  title: string;
  excerpt: string;
  image: string;
  author: string;
  date: string;
  id: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${siteConfig.url}/snapingo-logo.png`,
      },
    },
    mainEntityOfPage: `${siteConfig.url}/blog/${post.id}`,
  };
}
