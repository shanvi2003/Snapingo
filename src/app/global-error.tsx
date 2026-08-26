"use client";

import { useEffect } from "react";

// error.tsx only catches errors thrown inside a nested route segment - an
// error thrown by the root layout itself (or anything above it) skips every
// error.tsx boundary and would otherwise crash to a blank browser screen.
// This is the only boundary that can catch that, which is why it has to
// render its own <html>/<body> - there's no root layout left above it to
// supply them.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <section style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
          <div style={{ textAlign: "center", maxWidth: "28rem" }}>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.75rem" }}>Something went wrong</h1>
            <p style={{ color: "#57534e", marginBottom: "1.5rem" }}>
              We hit an unexpected error loading Snapingo. Please try again.
            </p>
            <button
              type="button"
              onClick={() => reset()}
              style={{
                borderRadius: "9999px",
                padding: "0.75rem 1.5rem",
                fontWeight: 600,
                fontSize: "0.875rem",
                color: "white",
                background: "#e11d48",
                border: "none",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        </section>
      </body>
    </html>
  );
}
