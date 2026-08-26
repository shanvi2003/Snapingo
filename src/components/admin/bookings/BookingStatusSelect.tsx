"use client";

import { useTransition } from "react";
import { updateBookingStatusAction } from "@/lib/actions/bookings";
import { BookingStatus } from "@/generated/prisma/enums";
import { bookingStatusLabels } from "@/components/admin/bookingStyles";
import CustomSelect from "@/components/CustomSelect";

export default function BookingStatusSelect({ bookingId, status }: { bookingId: string; status: BookingStatus }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className={pending ? "pointer-events-none opacity-60" : undefined}>
      <CustomSelect
        value={status}
        onChange={(next) => startTransition(() => updateBookingStatusAction(bookingId, next as BookingStatus))}
        options={Object.values(BookingStatus).map((s) => ({ value: s, label: bookingStatusLabels[s] }))}
      />
    </div>
  );
}
