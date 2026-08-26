import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSessionPayload, type SessionPayload } from "@/lib/session";
import type { StaffRole } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { staffCan, type StaffFeature } from "@/lib/permissions";

// Memoized per request so multiple calls (layout + page + nested components)
// only decrypt the cookie once. Returns null rather than redirecting — use
// requireSession() below wherever an unauthenticated visitor must be bounced.
export const getSession = cache(async (): Promise<SessionPayload | null> => {
  return getSessionPayload();
});

// The authoritative check for Server Actions (proxy.ts can't run for those).
// For pages, proxy.ts's route-based redirect is what's actually guaranteed
// to reach non-JS clients (see the comment there) - this is still called in
// every admin/staff layout as defense in depth for the browser case.
export async function requireSession(allowedRoles?: StaffRole[]): Promise<SessionPayload> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    redirect(session.role === "ADMIN" ? "/admin" : "/staff");
  }

  return session;
}

// Feature-level gate for the staff panel's role-restricted sections (leads,
// bookings, CMS edit screens, etc). ADMIN always passes - only STAFF accounts
// are checked against their jobRole via the permission matrix in
// src/lib/permissions.ts. Queries the DB directly (not the JWT's cached
// jobRole) so a role change an admin just made is honored immediately -
// this is what every gated Server Action calls to actually enforce a
// mutation; see proxy.ts for why the page-level story is different.
export async function requireStaffFeature(feature: StaffFeature): Promise<SessionPayload> {
  const session = await requireSession(["ADMIN", "STAFF"]);
  if (session.role === "ADMIN") return session;

  const user = await db.staffUser.findUnique({ where: { id: session.userId }, select: { jobRole: true } });
  if (!staffCan(user?.jobRole, feature)) {
    redirect("/staff");
  }
  return session;
}
