import type { Metadata } from "next";
import DestinationsGrid from "@/components/DestinationsGrid";
import { getAllDestinations } from "@/lib/content/destinations";

export const metadata: Metadata = {
  title: "Domestic & International Destinations | Snapingo",
  description:
    "Browse Snapingo's handpicked domestic and international destinations, each with curated, all-inclusive holiday packages.",
  alternates: { canonical: "/destinations" },
};

export default async function DestinationsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const initialType = type === "domestic" || type === "international" ? type : "all";
  const destinations = await getAllDestinations();

  return (
    <>
      <section className="bg-ink-50/60 pb-14 pt-28 sm:pb-16 sm:pt-32">
        <div className="container-app">
          <DestinationsGrid key={initialType} destinations={destinations} initialType={initialType} />
        </div>
      </section>
    </>
  );
}
