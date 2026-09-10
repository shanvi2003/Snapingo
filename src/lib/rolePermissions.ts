import "server-only";
import { db } from "@/lib/db";
import type { StaffJobRole } from "@/generated/prisma/enums";
import { defaultRolePermissions, jobRoleOptions, type StaffFeature } from "@/lib/permissions";

// Runtime source of truth for the staff permission matrix - a thin,
// always-fresh layer over defaultRolePermissions (see the comment there).
// Reads fall back to the built-in default per role; writes always upsert,
// so the RolePermission table only ever holds rows an admin has actually
// customized on /admin/permissions.

export async function getRolePermissions(jobRole: StaffJobRole): Promise<StaffFeature[]> {
  const row = await db.rolePermission.findUnique({ where: { jobRole } });
  return (row?.features as StaffFeature[] | undefined) ?? defaultRolePermissions[jobRole];
}

export async function getAllRolePermissions(): Promise<Record<StaffJobRole, StaffFeature[]>> {
  const rows = await db.rolePermission.findMany();
  const overrides = new Map(rows.map((r) => [r.jobRole, r.features as StaffFeature[]]));
  const result = {} as Record<StaffJobRole, StaffFeature[]>;
  for (const { value } of jobRoleOptions) {
    result[value] = overrides.get(value) ?? defaultRolePermissions[value];
  }
  return result;
}

export async function setAllRolePermissions(permissions: Record<StaffJobRole, StaffFeature[]>): Promise<void> {
  await db.$transaction(
    jobRoleOptions.map(({ value: jobRole }) =>
      db.rolePermission.upsert({
        where: { jobRole },
        create: { jobRole, features: permissions[jobRole] },
        update: { features: permissions[jobRole] },
      })
    )
  );
}
