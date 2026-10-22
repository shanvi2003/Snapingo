import "server-only";
import { db } from "@/lib/db";
import type { SessionPayload } from "@/lib/session";

/**
 * Who may change a quotation. Everyone with the Customized Packages feature
 * can see, search and download any quotation, but only the person who
 * created it (or an admin) may edit or delete it.
 */
export function canEditCustomPackage(
  session: Pick<SessionPayload, "role" | "userId"> | null,
  createdById: string
): boolean {
  if (session?.role === "ADMIN") return true;
  return Boolean(session) && session?.userId === createdById;
}

/**
 * canEditCustomPackage for a quotation known only by id - for Server Actions.
 * An archived quotation can't be edited or deleted again by anyone.
 */
export async function canEditCustomPackageById(
  session: Pick<SessionPayload, "role" | "userId"> | null,
  id: string
): Promise<boolean> {
  const quotation = await db.customPackage.findFirst({
    where: { id, deletedAt: null },
    select: { createdById: true },
  });
  return Boolean(quotation) && canEditCustomPackage(session, quotation!.createdById);
}
