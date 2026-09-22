"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSession, requireStaffFeature } from "@/lib/dal";
import type { LeadNoteStatus, LeadStatus } from "@/generated/prisma/client";
import { logLeadActivity } from "@/lib/leadActivity";
import { statusLabels, sourceLabels, noteStatusLabels } from "@/components/admin/leads/statusStyles";
import { notifyLeadAssigned } from "@/lib/notifications";
import { editLeadSchema } from "@/lib/validation/lead-edit";

export type FormState = { error: string } | { success: string } | undefined;

// Every lead screen exists at both /admin/... and /staff/..., so a change made
// from either has to invalidate both.
function revalidateLead(leadId?: string) {
  revalidatePath("/admin/leads");
  revalidatePath("/staff/leads");
  revalidatePath("/admin/activities");
  revalidatePath("/admin");
  revalidatePath("/staff");
  if (leadId) {
    revalidatePath(`/admin/leads/${leadId}`);
    revalidatePath(`/staff/leads/${leadId}`);
  }
}

async function actorName(userId: string): Promise<string> {
  const actor = await db.staffUser.findUnique({ where: { id: userId }, select: { name: true } });
  return actor?.name ?? "Someone";
}

// Admin plus staff whose jobRole grants the "leads" feature (Travel
// Executive, BDE) — see src/lib/permissions.ts.
export async function updateLeadStatusAction(leadId: string, status: LeadStatus): Promise<void> {
  const session = await requireStaffFeature("leads");
  await db.lead.update({ where: { id: leadId }, data: { status } });
  await logLeadActivity(
    leadId,
    "STATUS_CHANGED",
    `${await actorName(session.userId)} changed status to ${statusLabels[status]}`
  );
  revalidateLead(leadId);
}

/**
 * Assigns (or unassigns) a lead. ADMIN ONLY.
 *
 * Previously any staff member with the "leads" feature could assign a lead,
 * which in practice meant assigning it to themselves. The client asked for
 * assignment to be an admin decision, and this session check - not the
 * absence of a button - is what enforces it, because a Server Action is
 * reachable as a plain POST regardless of what the UI renders.
 *
 * Assigning is also what moves a lead out of "New": opening or reading a lead
 * leaves it New, by design, so the inbox reflects "nobody owns this yet"
 * rather than "nobody has looked at it".
 */
export async function assignLeadAction(leadId: string, staffId: string | null): Promise<void> {
  const session = await requireSession(["ADMIN"]);

  const current = await db.lead.findUnique({ where: { id: leadId }, select: { status: true } });
  if (!current) return;

  const lead = await db.lead.update({
    where: { id: leadId },
    data: {
      assignedToId: staffId,
      assignedAt: staffId ? new Date() : null,
      // Only the NEW -> ASSIGNED step is automatic. A lead already moved on to
      // Contacted/Quoted/Converted keeps that status when it's reassigned -
      // re-opening real progress would be worse than leaving it alone.
      ...(staffId && current.status === "NEW" ? { status: "ASSIGNED" as const } : {}),
      ...(!staffId && current.status === "ASSIGNED" ? { status: "NEW" as const } : {}),
    },
  });

  const [actor, assignee] = await Promise.all([
    actorName(session.userId),
    staffId ? db.staffUser.findUnique({ where: { id: staffId }, select: { name: true } }) : null,
  ]);

  await logLeadActivity(
    leadId,
    "ASSIGNED",
    assignee ? `${actor} assigned this lead to ${assignee.name}` : `${actor} unassigned this lead`
  );

  if (staffId && assignee) {
    await notifyLeadAssigned({
      leadId,
      staffId,
      who: lead.name ?? "Someone",
      sourceLabel: sourceLabels[lead.source],
      destinationName: lead.destinationName,
    });
  }

  revalidateLead(leadId);
}

/** Pins a lead to the top of the inbox. Any staff member with lead access. */
export async function toggleLeadFavoriteAction(leadId: string): Promise<void> {
  await requireStaffFeature("leads");
  const lead = await db.lead.findUnique({ where: { id: leadId }, select: { isFavorite: true } });
  if (!lead) return;
  await db.lead.update({ where: { id: leadId }, data: { isFavorite: !lead.isFavorite } });
  revalidateLead(leadId);
}

/**
 * Adds a note, optionally under one of the preset reasons.
 *
 * Two rules from the client live here: a preset reason cannot be saved without
 * the staff member typing why, and choosing "Won't Book With Me" also marks
 * the lead Cancelled - which is what puts it in the Cancelled Leads list.
 */
export async function addLeadNoteAction(
  leadId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireStaffFeature("leads");

  const body = String(formData.get("body") ?? "").trim();
  const rawStatus = String(formData.get("status") ?? "").trim();
  const status = rawStatus ? (rawStatus as LeadNoteStatus) : null;

  if (status && !(status in noteStatusLabels)) {
    return { error: "Choose a reason from the list." };
  }
  if (!body) {
    return {
      error: status
        ? "Add a note explaining this status - it can't be saved without one."
        : "Write something before saving the note.",
    };
  }

  const actor = await actorName(session.userId);

  await db.$transaction(async (tx) => {
    await tx.leadNote.create({ data: { leadId, authorId: session.userId, body, status } });
    if (status === "WONT_BOOK_WITH_ME") {
      await tx.lead.update({ where: { id: leadId }, data: { status: "CANCELLED" } });
    }
  });

  await logLeadActivity(
    leadId,
    "NOTE_ADDED",
    status ? `${actor} added a note: ${noteStatusLabels[status]}` : `${actor} added a note`
  );
  if (status === "WONT_BOOK_WITH_ME") {
    await logLeadActivity(leadId, "STATUS_CHANGED", `${actor} marked this lead Cancelled`);
  }

  revalidateLead(leadId);
  return { success: "Note added." };
}

/** Lets staff correct or fill in a lead's details while on a call. */
export async function updateLeadDetailsAction(
  leadId: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const session = await requireStaffFeature("leads");

  const parsed = editLeadSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };

  const before = await db.lead.findUnique({ where: { id: leadId }, select: { status: true } });
  if (!before) return { error: "This lead no longer exists." };

  await db.lead.update({ where: { id: leadId }, data: parsed.data });

  const actor = await actorName(session.userId);
  if (before.status !== parsed.data.status) {
    await logLeadActivity(
      leadId,
      "STATUS_CHANGED",
      `${actor} changed status to ${statusLabels[parsed.data.status]}`
    );
  }

  revalidateLead(leadId);
  return { success: "Lead updated." };
}
