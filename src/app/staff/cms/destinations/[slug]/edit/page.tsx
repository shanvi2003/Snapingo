import { notFound } from "next/navigation";
import { requireStaffFeature } from "@/lib/dal";
import { db } from "@/lib/db";
import DestinationForm from "@/components/admin/cms/DestinationForm";

export default async function StaffEditDestinationPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireStaffFeature("contentEdit");
  const { slug } = await params;
  const destination = await db.destination.findUnique({ where: { slug }, include: { highlights: true } });
  if (!destination) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">Edit Destination</h1>
      <DestinationForm
        isNew={false}
        defaults={{
          slug: destination.slug,
          name: destination.name,
          tagline: destination.tagline,
          image: destination.image,
          gallery: destination.gallery,
          packagesCount: destination.packagesCount,
          startingPrice: destination.startingPrice,
          type: destination.type,
          overview: destination.overview,
          bestTimeToVisit: destination.bestTimeToVisit,
          idealDuration: destination.idealDuration,
          highlights: destination.highlights.map((h) => ({ icon: h.icon, title: h.title, desc: h.desc })),
        }}
      />
    </div>
  );
}
