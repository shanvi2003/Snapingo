import type { Metadata } from "next";
import { Baloo_2, Inter } from "next/font/google";
import "./globals.css";
import OfferBar from "@/components/OfferBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";

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
  title: "Snapingo | Book Domestic & International Tour Packages",
  description:
    "Snapingo curates all-inclusive holiday packages, including flights, stay, transfers & sightseeing, for domestic and international destinations. Plan your perfect trip with Snapingo.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${baloo.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white font-sans text-ink-900">
        <OfferBar />
        <main className="relative flex-1">
          <Navbar />
          {children}
        </main>
        <Footer />
        <FloatingButtons />
      </body>
    </html>
  );
}
