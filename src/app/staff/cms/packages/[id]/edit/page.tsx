import { notFound } from "next/navigation";
import { requireStaffFeature } from "@/lib/dal";
import { db } from "@/lib/db";
import PackageForm from "@/components/admin/cms/PackageForm";

export default async function StaffEditPackagePage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaffFeature("contentEdit");
  const { id } = await params;
  const pkg = await db.package.findUnique({ where: { id }, include: { itinerary: { orderBy: { day: "asc" } } } });
  if (!pkg) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">Edit Package</h1>
      <PackageForm
        isNew={false}
        defaults={{
          id: pkg.id,
          title: pkg.title,
          destination: pkg.destination,
          destinationSlug: pkg.destinationSlug,
          type: pkg.type,
          image: pkg.image,
          duration: pkg.duration,
          price: pkg.price,
          originalPrice: pkg.originalPrice,
          rating: pkg.rating,
          reviews: pkg.reviews,
          badge: pkg.badge ?? undefined,
          featured: pkg.featured,
          hotDeal: pkg.hotDeal,
          inclusions: pkg.inclusions,
          categories: pkg.categories,
          exclusions: pkg.exclusions,
          highlights: pkg.highlights,
          itinerary: pkg.itinerary.map((d) => ({ title: d.title, desc: d.desc })),
        }}
      />
    </div>
  );
}
