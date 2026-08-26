"use client";

import { useEffect, useState } from "react";

/**
 * Opens once per browser session (via sessionStorage), after a short delay so
 * the underlying page finishes rendering first. Returns the same tuple shape
 * as useState so it can be swapped in directly.
 */
export function useAutoOpenOnce(sessionKey: string, delayMs = 900) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let alreadySeen = false;
    try {
      alreadySeen = Boolean(sessionStorage.getItem(sessionKey));
    } catch {
      alreadySeen = false;
    }
    if (alreadySeen) return;

    // The sessionStorage write happens only once this timeout actually
    // fires (not up front), so React Strict Mode's dev-only double-invoke
    // of this effect can't cancel the timer while the "seen" flag has
    // already been persisted by the discarded first run.
    const timeoutId = setTimeout(() => {
      try {
        sessionStorage.setItem(sessionKey, "1");
      } catch {
        // ignore - storage unavailable, just open without remembering
      }
      setOpen(true);
    }, delayMs);

    return () => clearTimeout(timeoutId);
  }, [sessionKey, delayMs]);

  return [open, setOpen] as const;
}
