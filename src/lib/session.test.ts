import { describe, it, expect } from "vitest";
import { SignJWT } from "jose";
import { decrypt } from "./session";

// `encrypt` itself isn't exported (session.ts keeps it module-private), so
// these tests build tokens the same way it does internally, using the same
// SESSION_SECRET vitest.config.ts injects, and verify decrypt() reads them
// back correctly. This is the exact function proxy.ts and getSessionPayload()
// both rely on for every authenticated request.
const encodedKey = new TextEncoder().encode(process.env.SESSION_SECRET!);

async function signToken(payload: Record<string, unknown>, expiresInSeconds: number) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresInSeconds)
    .sign(encodedKey);
}

describe("decrypt", () => {
  it("returns null for an undefined token", async () => {
    await expect(decrypt(undefined)).resolves.toBeNull();
  });

  it("returns null for garbage input", async () => {
    await expect(decrypt("not-a-real-jwt")).resolves.toBeNull();
  });

  it("round-trips a valid session token, defaulting jobRole to null when absent", async () => {
    const token = await signToken({ userId: "staff_123", role: "ADMIN" }, 3600);
    const result = await decrypt(token);
    expect(result).toEqual({ userId: "staff_123", role: "ADMIN", jobRole: null });
  });

  it("round-trips a token carrying a jobRole", async () => {
    const token = await signToken({ userId: "staff_456", role: "STAFF", jobRole: "BDE" }, 3600);
    const result = await decrypt(token);
    expect(result).toEqual({ userId: "staff_456", role: "STAFF", jobRole: "BDE" });
  });

  it("returns null for an expired token", async () => {
    const token = await signToken({ userId: "staff_123", role: "ADMIN" }, -10);
    await expect(decrypt(token)).resolves.toBeNull();
  });

  it("returns null when signed with a different secret", async () => {
    const wrongKey = new TextEncoder().encode("a-completely-different-secret-key");
    const token = await new SignJWT({ userId: "staff_123", role: "ADMIN" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(Math.floor(Date.now() / 1000) + 3600)
      .sign(wrongKey);
    await expect(decrypt(token)).resolves.toBeNull();
  });

  it("returns null when the payload is missing expected fields", async () => {
    const token = await signToken({ userId: "staff_123" }, 3600);
    await expect(decrypt(token)).resolves.toBeNull();
  });
});
