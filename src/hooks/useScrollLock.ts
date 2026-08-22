"use client";

import { useEffect } from "react";

/**
 * Locks background scroll while `locked` is true. Both <html> and <body> are
 * locked because globals.css sets `overflow-x: hidden` on each independently,
 * which per spec forces `overflow-y: auto` on both - making them two separate
 * scroll containers. Locking only one still lets the page scroll via the other.
 */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    document.documentElement.style.overflow = locked ? "hidden" : "";
    document.body.style.overflow = locked ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [locked]);
}
