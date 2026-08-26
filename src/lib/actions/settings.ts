"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/dal";
import { hashPassword, verifyPassword } from "@/lib/password";
import { passwordSchema } from "@/lib/validation/password";

export type FormState = { error: string } | { success: string } | undefined;

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New password and confirmation don't match.",
    path: ["confirmPassword"],
  });

export async function changePasswordAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await requireSession(["ADMIN", "STAFF"]);

  const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  }

  const user = await db.staffUser.findUniqueOrThrow({ where: { id: session.userId } });
  const ok = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!ok) return { error: "Current password is incorrect." };

  const passwordHash = await hashPassword(parsed.data.newPassword);
  await db.staffUser.update({ where: { id: session.userId }, data: { passwordHash } });

  return { success: "Password updated." };
}
