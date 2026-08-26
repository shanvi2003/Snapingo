"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireStaffFeature } from "@/lib/dal";
import type { LeadStatus } from "@/generated/prisma/client";
import { logLeadActivity } from "@/lib/leadActivity";
import { statusLabels } from "@/components/admin/leads/statusStyles";

// Admin plus staff whose jobRole grants the "leads" feature (Travel
// Executive, BDE) — see src/lib/permissions.ts.
export async function updateLeadStatusAction(leadId: string, status: LeadStatus): Promise<void> {
  const session = await requireStaffFeature("leads");
  await db.lead.update({ where: { id: leadId }, data: { status } });
  const actor = await db.staffUser.findUnique({ where: { id: session.userId }, select: { name: true } });
  await logLeadActivity(leadId, "STATUS_CHANGED", `${actor?.name ?? "Someone"} changed status to ${statusLabels[status]}`);
  revalidatePath("/admin/leads");
  revalidatePath("/staff/leads");
  revalidatePath("/admin/activities");
}

export async function assignLeadAction(leadId: string, staffId: string | null): Promise<void> {
  const session = await requireStaffFeature("leads");
  await db.lead.update({ where: { id: leadId }, data: { assignedToId: staffId } });
  const [actor, assignee] = await Promise.all([
    db.staffUser.findUnique({ where: { id: session.userId }, select: { name: true } }),
    staffId ? db.staffUser.findUnique({ where: { id: staffId }, select: { name: true } }) : null,
  ]);
  await logLeadActivity(
    leadId,
    "ASSIGNED",
    assignee
      ? `${actor?.name ?? "Someone"} assigned this lead to ${assignee.name}`
      : `${actor?.name ?? "Someone"} unassigned this lead`
  );
  revalidatePath("/admin/leads");
  revalidatePath("/staff/leads");
  revalidatePath("/admin/activities");
}

// Bound as action={addLeadNoteAction.bind(null, leadId)} on the note form,
// so the (already-known) leadId arrives pre-applied and formData supplies
// only what the visible form field actually holds.
export async function addLeadNoteAction(leadId: string, formData: FormData): Promise<void> {
  const session = await requireStaffFeature("leads");
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;
  await db.leadNote.create({ data: { leadId, authorId: session.userId, body } });
  const actor = await db.staffUser.findUnique({ where: { id: session.userId }, select: { name: true } });
  await logLeadActivity(leadId, "NOTE_ADDED", `${actor?.name ?? "Someone"} added a note`);
  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath(`/staff/leads/${leadId}`);
  revalidatePath("/admin/activities");
}
