import { db } from "@/lib/db";
import { getSession } from "@/lib/dal";
import { leadScope } from "@/lib/leads";
import { getDestinationNames } from "@/lib/content/destinations";
import BookingForm, { type BookingDefaults } from "@/components/admin/bookings/BookingForm";
import { createBookingAction } from "@/lib/actions/bookings";
import { toDateInput } from "@/lib/customPackageDefaults";


// The New Booking screen for both panels. It can start from a lead ("Convert
// to Booking" on a lead) or from a quotation ("Convert to Booking" on a
// customized package); a quotation carries far more - dates and price - so it
// wins over the lead's own details.
export default async function NewBookingView({
  leadId,
  customPackageId,
}: {
  leadId?: string;
  customPackageId?: string;
}) {
  const session = await getSession();
  const [lead, chosenQuotation, destinationOptions] = await Promise.all([
    // Pre-fill only from a lead this user may see (staff: assigned to them).
    leadId ? db.lead.findFirst({ where: { id: leadId, ...leadScope(session) } }) : null,
    customPackageId ? db.customPackage.findFirst({ where: { id: customPackageId, deletedAt: null } }) : null,
    getDestinationNames(),
  ]);
  // A lead converted after it was quoted books that quotation - the same one
  // createBookingAction takes the Trip ID from - so its dates and price come too.
  const quotation =
    chosenQuotation ??
    (lead
      ? await db.customPackage.findFirst({ where: { leadId: lead.id, deletedAt: null }, orderBy: { createdAt: "desc" } })
      : null);

  let defaults: BookingDefaults | undefined;
  if (quotation) {
    defaults = {
      customPackageId: quotation.id,
      leadId: lead?.id ?? quotation.leadId ?? undefined,
      packageId: lead?.packageId ?? undefined,
      packageTitle: lead?.packageTitle ?? undefined,
      travelerName: quotation.customerName,
      phone: quotation.customerPhone ?? "",
      email: quotation.customerEmail ?? "",
      destinationName: quotation.destinationName,
      travelStartDate: toDateInput(quotation.startDate),
      travelEndDate: toDateInput(quotation.endDate),
      totalAmount: quotation.price,
      taxAmount: quotation.gstAmount,
      notes: quotation.notes ?? undefined,
    };
  } else if (lead) {
    defaults = {
      leadId: lead.id,
      travelerName: lead.name ?? "",
      phone: lead.phone ?? "",
      email: lead.email ?? "",
      packageId: lead.packageId ?? undefined,
      packageTitle: lead.packageTitle ?? "",
      destinationName: lead.destinationName ?? "",
      travelStartDate: toDateInput(lead.startDate),
      travelEndDate: toDateInput(lead.endDate),
    };
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">New Booking</h1>
      <p className="mt-1 text-sm text-ink-500">
        {quotation
          ? `Pre-filled from quotation ${quotation.tripId}, which this booking keeps as its Trip ID. Check the details before saving.`
          : lead
            ? "Pre-filled from the selected lead. Check the details before saving."
            : "Record a booking that's already confirmed with the traveler over WhatsApp."}
      </p>
      <BookingForm
        action={createBookingAction}
        submitLabel="Create Booking"
        destinationOptions={destinationOptions}
        defaults={defaults}
      />
    </div>
  );
}
