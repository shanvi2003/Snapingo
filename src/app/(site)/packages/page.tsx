import type { Metadata } from "next";
import PackagesGrid from "@/components/PackagesGrid";
import type { PackageCategory } from "@/lib/packageCategoryHelpers";
import { getAllPackages } from "@/lib/content/packages";

export const metadata: Metadata = {
  title: "Holiday Packages | Snapingo",
  description:
    "Browse all-inclusive domestic and international holiday packages from Snapingo: flights, stay, meals & transfers bundled at one transparent price.",
  alternates: { canonical: "/packages" },
};

const VALID_CATEGORIES: PackageCategory[] = [
  "honeymoon",
  "family",
  "group",
  "adventure",
  "weekend",
  "solo",
  "religious",
  "corporate",
];

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; category?: string }>;
}) {
  const { type, category } = await searchParams;
  const initialType = type === "domestic" || type === "international" ? type : "all";
  const initialCategory = VALID_CATEGORIES.includes(category as PackageCategory)
    ? (category as PackageCategory)
    : null;
  const allPackages = await getAllPackages();

  return (
    <>
      <section className="bg-ink-50/60 pb-14 pt-28 sm:pb-16 sm:pt-32">
        <div className="container-app">
          <PackagesGrid
            key={`${initialType}-${initialCategory ?? "none"}`}
            allPackages={allPackages}
            initialType={initialType}
            initialCategory={initialCategory}
          />
        </div>
      </section>
    </>
  );
}
