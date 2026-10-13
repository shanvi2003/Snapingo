import "server-only";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { SessionPayload } from "@/lib/session";

/**
 * Which leads a signed-in user may see. Admins see every lead; a staff
 * account sees only the leads assigned to them personally - the client's
 * rule is that a lead belongs to one person, and the rest of the team must
 * not see it.
 *
 * Every lead query reachable from the staff panel goes through this, so
 * "hidden from the list" and "can't be opened by URL" stay the same rule.
 */
export function leadScope(session: Pick<SessionPayload, "role" | "userId"> | null): Prisma.LeadWhereInput {
  if (session?.role === "ADMIN") return {};
  // No session can't reach a lead query in practice (every caller sits behind
  // requireSession), but fail closed rather than return everything.
  return { assignedToId: session?.userId ?? "__no_session__" };
}

/** Whether this user may see (and therefore act on) one lead. */
export async function canAccessLead(
  session: Pick<SessionPayload, "role" | "userId"> | null,
  leadId: string
): Promise<boolean> {
  if (session?.role === "ADMIN") return true;
  const lead = await db.lead.findFirst({ where: { id: leadId, ...leadScope(session) }, select: { id: true } });
  return Boolean(lead);
}

export async function getLeadStats(scope: Prisma.LeadWhereInput = {}) {
  const [total, byStatusRaw, todayCount] = await Promise.all([
    db.lead.count({ where: scope }),
    db.lead.groupBy({ by: ["status"], where: scope, _count: { _all: true } }),
    db.lead.count({
      where: { ...scope, createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
  ]);

  const byStatus = Object.fromEntries(byStatusRaw.map((r) => [r.status, r._count._all]));

  return {
    total,
    today: todayCount,
    new: byStatus.NEW ?? 0,
    contacted: byStatus.CONTACTED ?? 0,
    quoted: byStatus.QUOTED ?? 0,
    converted: byStatus.CONVERTED ?? 0,
    closed: byStatus.CLOSED ?? 0,
  };
}
