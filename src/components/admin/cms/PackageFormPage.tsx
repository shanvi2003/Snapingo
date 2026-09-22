import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getSession } from "@/lib/dal";
import { getActiveMasterList } from "@/lib/masterData";
import { getContentBlocks } from "@/lib/contentBlocks";
import { getGstPercent } from "@/lib/settings";
import { getSuggestions } from "@/lib/suggestions";
import { nextPackageCode } from "@/lib/packageCodeServer";
import PackageForm from "@/components/admin/cms/PackageForm";

// Shared by all four package-form routes (admin/staff x new/edit). The form
// needs the same four lookups everywhere - destinations, badges, inclusions
// and the standard PDF copy - so loading them lives here once instead of
// being copy-pasted into each page, which is how the old `destination`/
// `destinationSlug` pair drifted in the first place.
export default async function PackageFormPage({
  isNew,
  packageId,
  basePath,
}: {
  isNew: boolean;
  packageId?: string;
  basePath: string;
}) {
  const [session, destinations, badges, inclusions, contentBlocks, gstPercent, titleSuggestions, upcomingPackageCode] =
    await Promise.all([
    getSession(),
    db.destination.findMany({ select: { slug: true, name: true, type: true }, orderBy: { name: "asc" } }),
    getActiveMasterList("PACKAGE_BADGE"),
    getActiveMasterList("PACKAGE_INCLUSION"),
    getContentBlocks(),
    getGstPercent(),
    getSuggestions("packageTitle"),
    nextPackageCode(),
  ]);

  const pkg = packageId
    ? await db.package.findUnique({
        where: { id: packageId },
        include: { itinerary: { orderBy: { day: "asc" } } },
      })
    : null;

  if (packageId && !pkg) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">
        {isNew ? "New Package" : "Edit Package"}
      </h1>
      <PackageForm
        isNew={isNew}
        destinations={destinations.map((d) => ({ value: d.slug, label: d.name, type: d.type }))}
        badges={badges.map((b) => ({ value: b.value, label: b.label }))}
        inclusionOptions={inclusions.map((i) => ({
          value: i.value,
          label: i.label,
          freeText: i.freeText,
        }))}
        contentBlocks={contentBlocks.map((b) => ({ key: b.key, title: b.title, body: b.body }))}
        contentEditHref={`${basePath}/cms/pdf-content`}
        gstPercent={gstPercent}
        titleSuggestions={titleSuggestions}
        nextPackageCode={upcomingPackageCode}
        // The PDF blocks are company-wide, so only an admin may reword them;
        // staff see the same preview with no Edit button.
        canEditContent={session?.role === "ADMIN"}
        defaults={
          pkg
            ? {
                id: pkg.id,
                code: pkg.code,
                title: pkg.title,
                destinationSlug: pkg.destinationSlug,
                type: pkg.type,
                image: pkg.image,
                durationNights: pkg.durationNights,
                durationDays: pkg.durationDays,
                price: pkg.price,
                originalPrice: pkg.originalPrice,
                rating: pkg.rating,
                reviews: pkg.reviews,
                tripsSold: pkg.tripsSold,
                badge: pkg.badge ?? undefined,
                featured: pkg.featured,
                hotDeal: pkg.hotDeal,
                inclusions: pkg.inclusions,
                customInclusions: pkg.customInclusions,
                exclusions: pkg.exclusions,
                categories: pkg.categories,
                highlights: pkg.highlights,
                itinerary: pkg.itinerary.map((d) => ({ title: d.title, desc: d.desc })),
              }
            : undefined
        }
      />
    </div>
  );
}
