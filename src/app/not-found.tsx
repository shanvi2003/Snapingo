import type { Metadata } from "next";
import Link from "next/link";
import { Compass, Home, MapPinned } from "lucide-react";
import { hotDealsLink } from "@/data/site";

export const metadata: Metadata = {
  title: "Page Not Found | Snapingo",
  description: "The page you're looking for doesn't exist. Explore Snapingo's tour packages, destinations and travel services instead.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="flex min-h-[70vh] items-center bg-ink-50/60 py-20">
      <div className="container-app">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-brand-100">
            <Compass className="h-10 w-10 text-brand-600" />
          </div>
          <p className="mt-6 font-heading text-6xl font-extrabold text-brand-600">404</p>
          <h1 className="mt-3 font-heading text-2xl font-bold text-ink-900 sm:text-3xl">
            Looks like you&apos;ve wandered off the map
          </h1>
          <p className="mt-3 text-base text-ink-900">
            The page you&apos;re looking for doesn&apos;t exist or may have moved. Let&apos;s get
            you back to planning your next trip.
          </p>
          <div className="mx-auto mt-8 flex w-max flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition hover:-translate-y-0.5 hover:bg-brand-700"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
            <Link
              href={hotDealsLink.href}
              className="flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink-900 shadow-sm ring-1 ring-ink-200 transition hover:-translate-y-0.5"
            >
              <MapPinned className="h-4 w-4" />
              Browse Packages
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
