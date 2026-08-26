import "server-only";
import { db } from "@/lib/db";

export async function getLeadStats() {
  const [total, byStatusRaw, todayCount] = await Promise.all([
    db.lead.count(),
    db.lead.groupBy({ by: ["status"], _count: { _all: true } }),
    db.lead.count({
      where: { createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
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
