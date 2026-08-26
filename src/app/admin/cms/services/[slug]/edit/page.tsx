import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ServiceForm from "@/components/admin/cms/ServiceForm";

export default async function EditServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await db.service.findUnique({ where: { slug }, include: { highlights: true } });
  if (!service) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">Edit Service</h1>
      <ServiceForm
        defaults={{
          slug: service.slug,
          name: service.name,
          tagline: service.tagline,
          image: service.image,
          overview: service.overview,
          highlights: service.highlights.map((h) => ({ icon: h.icon, title: h.title, desc: h.desc })),
        }}
      />
    </div>
  );
}
