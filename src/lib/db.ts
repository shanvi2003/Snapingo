import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Connection pool sizing, measured against this database rather than guessed:
// Postgres reports max_connections = 100 with 3 reserved for superusers, so
// there are ~97 to share, and DATABASE_URL is a *direct* connection - there
// is no PgBouncer in front of it (it resolves to the same host and port as
// DIRECT_URL). An earlier comment here claimed otherwise; the pool below is
// the only thing limiting connections, so it has to be sized honestly.
//
// `max: 1` used to be the value everywhere. It meant every query in a process
// queued behind a single connection: one admin page that fires four queries
// ran them one after another, and while a connection was being re-established
// the whole page waited on it. That is what produced "timeout exceeded when
// trying to connect".
const isProduction = process.env.NODE_ENV === "production";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  // Development is a single long-lived process serving the whole app, so a
  // handful of connections costs nothing and lets a page's queries actually
  // run in parallel. Production runs many short-lived instances, so each one
  // stays small - even 20 instances at 3 each sits well under the ~97 limit.
  max: isProduction ? 3 : 5,
  // Render's external endpoint requires TLS; `pg` doesn't negotiate it
  // unless told to. Render's cert isn't in Node's default trust store, so
  // this matches Render's own connection docs (verification-optional TLS).
  ssl: { rejectUnauthorized: false },

  // The three settings below exist because the database is reached over the
  // public internet rather than sitting next to the app.
  //
  // TCP keepalive: a pooled connection that sits idle across a laptop sleep,
  // a VPN blip or a NAT timeout is silently dropped at the network layer -
  // the socket still looks open to `pg`, so the next query is sent into a
  // dead connection and surfaces as "Can't reach database server". Keepalive
  // probes notice the break and let the pool replace the connection instead.
  keepAlive: true,
  keepAliveInitialDelayMillis: 10_000,

  // Without this, waiting for a connection has no deadline and a briefly
  // unreachable database makes the page hang with nothing in the logs.
  //
  // 30s, not the 10s this started at: a cold connect to Singapore was
  // measured at 1-2s, but that is TCP plus a TLS handshake over a home
  // connection, and 10s turned an ordinary slow moment into a hard error on
  // a page that was only waiting its turn. This is a "something is actually
  // wrong" deadline, not a latency budget.
  connectionTimeoutMillis: 30_000,

  // Keep an established connection around between clicks. The pg default of
  // 10s closes it while someone is still reading the page, so the next action
  // pays the 1-2s handshake again - noticeable on every admin screen.
  idleTimeoutMillis: 60_000,
});

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Cached on globalThis so warm serverless invocations (and Next dev's hot
// reload) reuse the same client instead of opening a fresh pool every time.
export const db = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
