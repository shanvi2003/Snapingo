"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/dal";
import { hashPassword } from "@/lib/password";
import { passwordSchema } from "@/lib/validation/password";

export type FormState = { error: string } | undefined;

const createStaffSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    email: z.email(),
    password: passwordSchema,
    role: z.enum(["ADMIN", "STAFF"]),
    jobRole: z.enum(["TRAVEL_EXECUTIVE", "BDE", "SOCIAL_MEDIA_EXECUTIVE", "DIGITAL_MARKETING", ""]).optional(),
  })
  // STAFF accounts must pick one of the 4 job roles - it's what drives their
  // access. ADMIN accounts skip it (they always have full access).
  .refine((data) => data.role !== "STAFF" || Boolean(data.jobRole), {
    message: "Pick a job role for staff accounts.",
    path: ["jobRole"],
  });

export async function createStaffAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  await requireSession(["ADMIN"]);
  const parsed = createStaffSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };

  const existing = await db.staffUser.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: "An account with this email already exists." };

  const passwordHash = await hashPassword(parsed.data.password);
  await db.staffUser.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role,
      jobRole: parsed.data.role === "STAFF" ? parsed.data.jobRole || null : null,
    },
  });

  revalidatePath("/admin/team");
  return undefined;
}

const jobRoleValues = ["TRAVEL_EXECUTIVE", "BDE", "SOCIAL_MEDIA_EXECUTIVE", "DIGITAL_MARKETING"] as const;

// Only meaningful for STAFF rows - ADMIN accounts always have full access
// regardless of jobRole. Takes effect on that staff member's next login: the
// permission check proxy.ts relies on reads jobRole from their session JWT
// (see src/lib/session.ts), not the DB, so an already-open session keeps its
// old access until it's refreshed. Every Server Action re-checks the DB
// directly though, so a stale session can't actually mutate anything the new
// jobRole disallows - only page visibility lags.
export async function updateStaffJobRoleAction(id: string, jobRole: (typeof jobRoleValues)[number]): Promise<void> {
  await requireSession(["ADMIN"]);
  if (!jobRoleValues.includes(jobRole)) return;
  const target = await db.staffUser.findUnique({ where: { id }, select: { role: true } });
  if (target?.role !== "STAFF") return;
  await db.staffUser.update({ where: { id }, data: { jobRole } });
  revalidatePath("/admin/team");
}

export async function toggleStaffActiveAction(id: string, isActive: boolean): Promise<void> {
  const session = await requireSession(["ADMIN"]);
  if (session.userId === id) return; // can't deactivate yourself
  await db.staffUser.update({ where: { id }, data: { isActive } });
  revalidatePath("/admin/team");
}

const resetPasswordSchema = z.object({
  userId: z.string(),
  password: passwordSchema,
});

export async function resetStaffPasswordAction(formData: FormData): Promise<FormState> {
  await requireSession(["ADMIN"]);
  const parsed = resetPasswordSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the password." };
  const passwordHash = await hashPassword(parsed.data.password);
  await db.staffUser.update({ where: { id: parsed.data.userId }, data: { passwordHash } });
  revalidatePath("/admin/team");
}
