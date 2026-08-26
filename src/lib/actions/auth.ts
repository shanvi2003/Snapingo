"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSession, deleteSession, getSessionPayload } from "@/lib/session";

export type LoginState = { error: string } | undefined;

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes

// A bcrypt hash of an arbitrary, unknown password - not any real user's
// hash. Compared against on a nonexistent email so verifyPassword still
// does a full bcrypt comparison either way; skipping it entirely when
// `user` is null would make "no such account" respond measurably faster
// than "wrong password for a real account", letting a caller enumerate
// which emails have staff accounts.
const DUMMY_HASH = "$2b$12$0MLFGGTcw4y8.ivrYPmmLeCQTfW3dCNeCxkmKD5Ko/C4FR99mhCM2";

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const user = await db.staffUser.findUnique({ where: { email } });

  if (user?.lockedUntil && user.lockedUntil > new Date()) {
    const minutes = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
    return { error: `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.` };
  }

  const passwordOk = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);

  // Same generic message whether the email doesn't exist or the password is
  // wrong — never confirm which one to an unauthenticated caller.
  if (!user || !user.isActive || !passwordOk) {
    if (user && user.isActive) {
      const attempts = user.failedLoginAttempts + 1;
      await db.staffUser.update({
        where: { id: user.id },
        data:
          attempts >= MAX_FAILED_ATTEMPTS
            ? { failedLoginAttempts: 0, lockedUntil: new Date(Date.now() + LOCKOUT_MS) }
            : { failedLoginAttempts: attempts },
      });
    }
    return { error: "Invalid email or password." };
  }

  if (user.failedLoginAttempts > 0 || user.lockedUntil) {
    await db.staffUser.update({ where: { id: user.id }, data: { failedLoginAttempts: 0, lockedUntil: null } });
  }

  await createSession(user.id, user.role, user.jobRole);
  redirect(user.role === "ADMIN" ? "/admin" : "/staff");
}

export async function logoutAction(): Promise<void> {
  const session = await getSessionPayload();
  await deleteSession();
  redirect(session?.role === "ADMIN" ? "/login" : "/staff/login");
}
