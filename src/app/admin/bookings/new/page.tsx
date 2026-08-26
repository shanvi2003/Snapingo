import { db } from "@/lib/db";
import { getDestinationNames } from "@/lib/content/destinations";
import BookingForm from "@/components/admin/bookings/BookingForm";
import { createBookingAction } from "@/lib/actions/bookings";

export default async function NewBookingPage({ searchParams }: { searchParams: Promise<{ leadId?: string }> }) {
  const { leadId } = await searchParams;
  const [lead, destinationOptions] = await Promise.all([
    leadId ? db.lead.findUnique({ where: { id: leadId } }) : null,
    getDestinationNames(),
  ]);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">New Booking</h1>
      <p className="mt-1 text-sm text-ink-500">
        {lead ? "Pre-filled from the selected lead — check the details before saving." : "Record a booking that's already confirmed with the traveler over WhatsApp."}
      </p>
      <BookingForm
        action={createBookingAction}
        submitLabel="Create Booking"
        destinationOptions={destinationOptions}
        defaults={
          lead
            ? {
                leadId: lead.id,
                travelerName: lead.name ?? "",
                phone: lead.phone ?? "",
                email: lead.email ?? "",
                packageId: lead.packageId ?? undefined,
                packageTitle: lead.packageTitle ?? "",
                destinationName: lead.destinationName ?? "",
              }
            : undefined
        }
      />
    </div>
  );
}
