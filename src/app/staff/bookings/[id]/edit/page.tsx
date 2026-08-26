import { notFound } from "next/navigation";
import { requireStaffFeature } from "@/lib/dal";
import { db } from "@/lib/db";
import { getDestinationNames } from "@/lib/content/destinations";
import BookingForm from "@/components/admin/bookings/BookingForm";
import { updateBookingAction } from "@/lib/actions/bookings";

export default async function StaffEditBookingPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaffFeature("bookings");
  const { id } = await params;
  const [booking, destinationOptions] = await Promise.all([
    db.booking.findUnique({ where: { id } }),
    getDestinationNames(),
  ]);
  if (!booking) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">Edit Booking</h1>
      <BookingForm
        action={updateBookingAction.bind(null, booking.id)}
        submitLabel="Save Changes"
        destinationOptions={destinationOptions}
        defaults={{
          travelerName: booking.travelerName,
          phone: booking.phone,
          email: booking.email ?? "",
          packageId: booking.packageId ?? undefined,
          packageTitle: booking.packageTitle ?? "",
          destinationName: booking.destinationName ?? "",
          travelStartDate: booking.travelStartDate?.toISOString().slice(0, 10),
          travelEndDate: booking.travelEndDate?.toISOString().slice(0, 10),
          totalAmount: booking.totalAmount,
          taxAmount: booking.taxAmount,
          notes: booking.notes ?? "",
        }}
      />
    </div>
  );
}
