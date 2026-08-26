"use client";

import { useEffect } from "react";

/**
 * Locks background scroll while `locked` is true. Plain `overflow: hidden`
 * on <html>/<body> is enough on desktop, but most mobile browsers (iOS
 * Safari especially) don't reliably honor it for touch-scroll once there's
 * a nested scrollable element inside the overlay (e.g. a filter sheet's own
 * scroll area) - the touch drag can still "leak" through to the page
 * underneath. Pinning the body with `position: fixed` removes it from the
 * document's scroll flow entirely, which mobile browsers do respect, so
 * that's the primary lock; the scroll position is saved and restored so the
 * page doesn't jump when the lock releases.
 */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;
    const previousBody = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    const previousHtmlOverflow = html.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    return () => {
      html.style.overflow = previousHtmlOverflow;
      body.style.position = previousBody.position;
      body.style.top = previousBody.top;
      body.style.left = previousBody.left;
      body.style.right = previousBody.right;
      body.style.width = previousBody.width;
      body.style.overflow = previousBody.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}
