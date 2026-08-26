"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RefreshCw, TriangleAlert } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-[70vh] items-center bg-ink-50/60 py-20">
      <div className="container-app">
        <div className="mx-auto max-w-lg text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-red-100">
            <TriangleAlert className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="mt-6 font-heading text-2xl font-bold text-ink-900 sm:text-3xl">
            Something went wrong
          </h1>
          <p className="mt-3 text-base text-ink-900">
            We hit an unexpected error while loading this page. Please try again, or head back to
            the homepage.
          </p>
          <div className="mx-auto mt-8 flex w-max flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => reset()}
              className="flex items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition hover:-translate-y-0.5 hover:bg-brand-700"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink-900 shadow-sm ring-1 ring-ink-200 transition hover:-translate-y-0.5"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
