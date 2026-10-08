"use server";

import { db } from "@/lib/db";
import { requireStaffFeature } from "@/lib/dal";
import { defaultsFromQuotation, loadQuotation } from "@/lib/customPackageDefaults";
import type { CustomPackageDefaults } from "@/components/admin/customPackages/CustomPackageForm";

export type QuotationMatch = {
  id: string;
  tripId: string;
  customerName: string;
  customerPhone: string | null;
  destinationName: string;
  durationNights: number;
  durationDays: number;
};

/**
 * Saved quotations matching a Trip ID or a past customer's name, phone or
 * email - what staff search when a new customer wants a trip already quoted
 * to someone else.
 */
export async function searchQuotationsAction(query: string, excludeId?: string): Promise<QuotationMatch[]> {
  await requireStaffFeature("customPackages");
  const q = query.trim();
  if (q.length < 2) return [];

  const contains = { contains: q, mode: "insensitive" as const };
  return db.customPackage.findMany({
    where: {
      ...(excludeId ? { id: { not: excludeId } } : {}),
      OR: [{ tripId: contains }, { customerName: contains }, { customerPhone: contains }, { customerEmail: contains }],
    },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      id: true,
      tripId: true,
      customerName: true,
      customerPhone: true,
      destinationName: true,
      durationNights: true,
      durationDays: true,
    },
  });
}

/**
 * One quotation's trip, ready to drop into the form - everything except who
 * it was for. The customer's name, phone and email, the lead it came from,
 * its own id and its notes (usually that customer's message) stay with the
 * original; the new quotation keeps its own.
 */
export async function getQuotationCopyAction(id: string): Promise<CustomPackageDefaults | null> {
  await requireStaffFeature("customPackages");
  const quotation = await loadQuotation(id);
  if (!quotation) return null;

  const defaults = await defaultsFromQuotation(quotation);
  return {
    ...defaults,
    id: undefined,
    leadId: undefined,
    customerName: undefined,
    customerPhone: undefined,
    customerEmail: undefined,
    notes: undefined,
  };
}
