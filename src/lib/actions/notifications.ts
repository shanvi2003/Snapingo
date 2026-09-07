"use server";

import { getSession } from "@/lib/dal";
import { db } from "@/lib/db";
import type { NotificationType } from "@/generated/prisma/enums";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string;
  leadId: string | null;
};

// Polled from the notification bell (client component) in both the admin
// and staff panels. Scoped entirely by session.userId as `recipientId` -
// that's what already makes "admin sees every new lead" vs "staff sees only
// their own assignments" work, since notifyNewLead() fans out to every admin
// while notifyLeadAssigned()/notifyLeadFollowup() target one staff member.
// Returns an empty result rather than redirecting if unauthenticated, since
// a background poll firing after a session expires shouldn't throw a
// Next.js redirect through a client component.
export async function getMyNotificationsAction(): Promise<{ items: NotificationItem[]; unreadCount: number }> {
  const session = await getSession();
  if (!session) return { items: [], unreadCount: 0 };

  const [rows, unreadCount] = await Promise.all([
    db.notification.findMany({
      where: { recipientId: session.userId },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    db.notification.count({ where: { recipientId: session.userId, read: false } }),
  ]);

  return {
    items: rows.map((n) => ({
      id: n.id,
      type: n.type,
      message: n.message,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
      leadId: n.leadId,
    })),
    unreadCount,
  };
}

// Called when the bell dropdown opens (mark everything read) or when a
// single notification is clicked (mark just that one) - either way scoped
// to `recipientId: session.userId` so one staff member can never mark
// another's notifications read.
export async function markNotificationsReadAction(ids?: string[]): Promise<void> {
  const session = await getSession();
  if (!session) return;

  await db.notification.updateMany({
    where: {
      recipientId: session.userId,
      read: false,
      ...(ids && ids.length > 0 ? { id: { in: ids } } : {}),
    },
    data: { read: true },
  });
}
