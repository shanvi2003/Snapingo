"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteBookingAction } from "@/lib/actions/bookings";
import ConfirmModal from "@/components/admin/ConfirmModal";

// Distinct from the generic admin/cms DeleteButton: this one navigates away
// afterward since it's used on the booking's own detail page — deleting the
// row you're currently viewing and staying put would just 404 on refresh.
export default function DeleteBookingButton({ bookingId, basePath }: { bookingId: string; basePath: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        disabled={pending}
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
        Delete
      </button>
      <ConfirmModal
        open={open}
        message="Delete this booking and its payment history? This can't be undone."
        pending={pending}
        onCancel={() => setOpen(false)}
        onConfirm={() =>
          startTransition(async () => {
            await deleteBookingAction(bookingId);
            router.push(`${basePath}/bookings`);
          })
        }
      />
    </>
  );
}
