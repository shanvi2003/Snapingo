import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import HotelForm from "@/components/admin/cms/HotelForm";

export default async function EditHotelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const hotel = await db.hotel.findUnique({ where: { id } });
  if (!hotel) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">Edit Hotel</h1>
      <HotelForm isNew={false} defaults={hotel} />
    </div>
  );
}
