import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Vercel serverless functions can scale to many concurrent instances; each
// one that opened its own uncapped connection pool would exhaust Render
// Postgres's connection limit fast. DATABASE_URL points at Render's pooled
// (PgBouncer) connection string, and `max: 1` caps how many connections
// *this one instance* holds locally on top of that — the pooler is the real
// safety net, this is just not fighting it.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  // Render's external endpoint requires TLS; `pg` doesn't negotiate it
  // unless told to. Render's cert isn't in Node's default trust store, so
  // this matches Render's own connection docs (verification-optional TLS).
  ssl: { rejectUnauthorized: false },
});

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Cached on globalThis so warm serverless invocations (and Next dev's hot
// reload) reuse the same client instead of opening a fresh pool every time.
export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
