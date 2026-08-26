import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { StaffRole } from "@/generated/prisma/client";
import type { StaffJobRole } from "@/generated/prisma/enums";

const SESSION_COOKIE = "snapingo_session";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const secretKey = process.env.SESSION_SECRET;
if (!secretKey) {
  throw new Error("SESSION_SECRET env var is not set");
}
const encodedKey = new TextEncoder().encode(secretKey);

export type SessionPayload = {
  userId: string;
  role: StaffRole;
  // Baked into the token (not looked up per-request) so proxy.ts can enforce
  // staff feature access with a real HTTP redirect before any rendering
  // starts - a redirect() thrown deep in a page during render only produces
  // a client-side meta-refresh once streaming has begun (root loading.tsx
  // wraps every route in a Suspense boundary), which non-JS clients like
  // curl, bots, or a bookmarked hard-navigation never follow. If an admin
  // changes a staff member's jobRole, it takes effect on their next login
  // (or session expiry) - requireStaffFeature() in dal.ts re-checks the DB
  // directly for Server Actions, which aren't affected by this at all.
  jobRole: StaffJobRole | null;
};

async function encrypt(payload: SessionPayload, expiresAt: Date): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(encodedKey);
}

// Exported (not just used internally) so proxy.ts can do its optimistic,
// cookie-only check via `req.cookies.get(...)` without importing
// `next/headers`'s request-scoped `cookies()` helper.
export async function decrypt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedKey, { algorithms: ["HS256"] });
    if (typeof payload.userId !== "string" || typeof payload.role !== "string") return null;
    const jobRole = typeof payload.jobRole === "string" ? (payload.jobRole as StaffJobRole) : null;
    return { userId: payload.userId, role: payload.role as StaffRole, jobRole };
  } catch {
    return null;
  }
}

export async function createSession(userId: string, role: StaffRole, jobRole: StaffJobRole | null): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  const session = await encrypt({ userId, role, jobRole }, expiresAt);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionPayload(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  return decrypt(cookieStore.get(SESSION_COOKIE)?.value);
}

export { SESSION_COOKIE };
