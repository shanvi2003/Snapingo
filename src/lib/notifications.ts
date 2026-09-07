import "server-only";
import { db } from "@/lib/db";

// In-panel notification fan-out, called from inside the lead Server Actions
// (createLeadAction, assignLeadAction) right after the underlying Lead
// mutation. This intentionally never talks to an external email/SMS
// provider - the notification bell in the admin/staff panel is the only
// consumer, so a DB row is all that's needed.
function detailSuffix(destinationName?: string | null): string {
  return destinationName ? ` — ${destinationName}` : "";
}

// Every active admin sees every new lead, regardless of who (if anyone) it
// gets auto-assigned to - admins need full visibility, not just "their own".
export async function notifyNewLead(params: {
  leadId: string;
  who: string;
  sourceLabel: string;
  destinationName?: string | null;
}): Promise<void> {
  const admins = await db.staffUser.findMany({
    where: { role: "ADMIN", isActive: true },
    select: { id: true },
  });
  if (admins.length === 0) return;

  const message = `New ${params.sourceLabel} lead from ${params.who}${detailSuffix(params.destinationName)}`;
  await db.notification.createMany({
    data: admins.map((admin) => ({
      recipientId: admin.id,
      leadId: params.leadId,
      type: "NEW_LEAD" as const,
      message,
    })),
  });
}

// Fired both on auto-assignment at creation and on a manual (re)assignment
// later from the lead detail page - either way, the newly-assigned staff
// member should hear about it once, right then.
export async function notifyLeadAssigned(params: {
  leadId: string;
  staffId: string;
  who: string;
  sourceLabel: string;
  destinationName?: string | null;
}): Promise<void> {
  await db.notification.create({
    data: {
      recipientId: params.staffId,
      leadId: params.leadId,
      type: "LEAD_ASSIGNED",
      message: `${params.who} (${params.sourceLabel}${detailSuffix(params.destinationName)}) was assigned to you`,
    },
  });
}

// Fired when the duplicate-lead check in createLeadAction folds a repeat
// submission into an existing (already-assigned) lead instead of creating a
// new one - the assignee should still know the customer came back, even
// though no new Lead row exists to show it in their queue.
export async function notifyLeadFollowup(params: {
  leadId: string;
  staffId: string;
  who: string;
  sourceLabel: string;
  destinationName?: string | null;
}): Promise<void> {
  await db.notification.create({
    data: {
      recipientId: params.staffId,
      leadId: params.leadId,
      type: "LEAD_FOLLOWUP",
      message: `${params.who} followed up again (${params.sourceLabel}${detailSuffix(params.destinationName)})`,
    },
  });
}
