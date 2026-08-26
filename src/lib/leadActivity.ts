import "server-only";
import { db } from "@/lib/db";
import type { LeadActivityType } from "@/generated/prisma/enums";

export function logLeadActivity(leadId: string, type: LeadActivityType, message: string) {
  return db.leadActivity.create({ data: { leadId, type, message } });
}
