import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import FlightForm from "@/components/admin/cms/FlightForm";

export default async function EditFlightPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const flight = await db.flight.findUnique({ where: { id } });
  if (!flight) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">Edit Flight</h1>
      <FlightForm isNew={false} defaults={flight} />
    </div>
  );
}
