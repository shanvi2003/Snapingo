import type { Metadata, Viewport } from "next";
import { Baloo_2, Inter } from "next/font/google";
import { MotionConfig } from "framer-motion";
import "./globals.css";
import { siteConfig } from "@/lib/siteConfig";
import { JsonLd, organizationJsonLd } from "@/lib/structuredData";
import SuppressInstallPrompt from "@/components/SuppressInstallPrompt";

const baloo = Baloo_2({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "tour packages",
    "holiday packages India",
    "international tour packages",
    "domestic tour packages",
    "honeymoon packages",
    "family tour packages",
    "travel agency",
    "flight booking",
    "hotel booking",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.legalName,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.title,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.defaultOgImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.defaultOgImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#ec1278",
  width: "device-width",
  initialScale: 1,
  // Default mobile Chrome behavior on keyboard-open is "resizes-visual": the
  // layout viewport (what position:fixed/absolute measure against) stays
  // full-height while only the visible area shrinks under the keyboard.
  // Combined with useScrollLock's position:fixed body-pin (needed for iOS
  // touch-scroll locking - see that hook's own comment), focusing an input
  // inside a locked modal (e.g. the trip planner's email/date fields) can
  // leave the page's real scroll position and the layout's fixed frame out
  // of sync once the keyboard closes - showing as a frozen page with the
  // nav bar shifted out of view until a full reload re-syncs everything.
  // "resizes-content" makes the browser shrink the layout viewport itself
  // to match the visible area, which keeps fixed-position elements aligned
  // with what's actually on screen while the keyboard is up.
  interactiveWidget: "resizes-content",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${baloo.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white font-sans text-ink-900">
        <JsonLd data={organizationJsonLd()} />
        <SuppressInstallPrompt />
        <MotionConfig reducedMotion="never">{children}</MotionConfig>
      </body>
    </html>
  );
}
