"use client";

import { useTransition } from "react";
import { Star } from "lucide-react";
import { toggleLeadFavoriteAction } from "@/lib/actions/admin-leads";

export default function LeadFavoriteButton({
  leadId,
  isFavorite,
  variant = "button",
}: {
  leadId: string;
  isFavorite: boolean;
  // "icon" is the compact form used in the inbox table, where a full button
  // would crowd the row.
  variant?: "button" | "icon";
}) {
  const [pending, startTransition] = useTransition();

  const toggle = () => startTransition(() => toggleLeadFavoriteAction(leadId));
  const label = isFavorite ? "Remove from favourites" : "Mark as favourite";

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-label={label}
        title={label}
        className="grid h-7 w-7 place-items-center rounded-full transition hover:bg-ink-50 disabled:opacity-50"
      >
        <Star
          className={`h-4 w-4 ${isFavorite ? "fill-gold-500 text-gold-500" : "text-ink-300"}`}
        />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition disabled:opacity-60 ${
        isFavorite
          ? "border-gold-400 bg-gold-400/15 text-gold-600"
          : "border-ink-200 text-ink-700 hover:border-gold-400 hover:text-gold-600"
      }`}
    >
      <Star className={`h-4 w-4 ${isFavorite ? "fill-gold-500 text-gold-500" : ""}`} />
      {isFavorite ? "Favourite" : "Mark favourite"}
    </button>
  );
}
