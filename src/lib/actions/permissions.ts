"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/dal";
import { setAllRolePermissions } from "@/lib/rolePermissions";
import { rolePermissionsSchema } from "@/lib/validation/permissions";
import type { StaffFeature } from "@/lib/permissions";
import type { StaffJobRole } from "@/generated/prisma/enums";

export type FormState = { error: string } | undefined;

export async function saveRolePermissionsAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  // Admin only - this changes what every staff account of a given job role
  // can reach, not just the caller's own access.
  await requireSession(["ADMIN"]);

  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get("permissions") ?? ""));
  } catch {
    return { error: "Could not read the submitted permissions." };
  }

  const parsed = rolePermissionsSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the selected permissions." };
  }

  await setAllRolePermissions(parsed.data as Record<StaffJobRole, StaffFeature[]>);

  // Nothing outside /admin/permissions itself needs revalidating: the staff
  // panel's nav and every requireStaffFeature() check already read the
  // permissions table fresh on every request (see src/lib/rolePermissions.ts),
  // so this takes effect for staff immediately without a cache to bust.
  revalidatePath("/admin/permissions");
  redirect("/admin/permissions");
}
