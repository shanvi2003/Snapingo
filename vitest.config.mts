import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // src/lib/session.ts throws at import time if SESSION_SECRET is unset -
    // this is a fixed test-only value, never used outside the test run.
    env: {
      SESSION_SECRET: "vitest-only-fixed-test-secret-do-not-use-in-prod",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      // See test/server-only-stub.ts for why this alias exists.
      "server-only": path.resolve(import.meta.dirname, "./test/server-only-stub.ts"),
    },
  },
});
