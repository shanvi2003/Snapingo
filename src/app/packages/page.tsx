import type { Metadata } from "next";
import PackagesGrid from "@/components/PackagesGrid";

export const metadata: Metadata = {
  title: "Holiday Packages | Snapingo",
  description:
    "Browse all-inclusive domestic and international holiday packages from Snapingo: flights, stay, meals & transfers bundled at one transparent price.",
};

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const initialType = type === "domestic" || type === "international" ? type : "all";

  return (
    <>
      <section className="bg-ink-50/60 pb-14 pt-28 sm:pb-16 sm:pt-32">
        <div className="container-app">
          <PackagesGrid key={initialType} initialType={initialType} />
        </div>
      </section>
    </>
  );
}
