// Vitest stand-in for the real `server-only` package, which unconditionally
// throws outside a bundler that does the alias/dead-code substitution for
// it (webpack/Turbopack do this for Next's client/server split; Vitest runs
// plain Node, so it needs an inert stub instead). Only wired up in
// vitest.config.ts's resolve.alias — the real npm package stays untouched
// everywhere else, including the actual Next.js app.
export {};
