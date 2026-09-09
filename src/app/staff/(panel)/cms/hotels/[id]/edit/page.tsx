import { notFound } from "next/navigation";
import { requireStaffFeature } from "@/lib/dal";
import { db } from "@/lib/db";
import HotelForm from "@/components/admin/cms/HotelForm";

export default async function StaffEditHotelPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaffFeature("hotelsEdit");
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
