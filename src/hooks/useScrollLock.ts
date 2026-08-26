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
 *
 * Several overlays (nav menu, booking modals, gallery, trip planner) can be
 * locked at once. A ref-counted, module-level lock makes that safe: only the
 * first lock snapshots/pins, only the last unlock restores - so locks
 * closing out of order never leave <body> stuck mid-pin (which was
 * presenting on mobile as a frozen page that wouldn't scroll or
 * pull-to-refresh, with the fixed nav bar's contents hidden behind it).
 */
let lockCount = 0;
let savedState: {
  htmlOverflow: string;
  bodyPosition: string;
  bodyTop: string;
  bodyLeft: string;
  bodyRight: string;
  bodyWidth: string;
  bodyOverflow: string;
  scrollY: number;
} | null = null;

export function isScrollLocked() {
  return lockCount > 0;
}

export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    lockCount += 1;
    if (lockCount === 1) {
      const body = document.body;
      const html = document.documentElement;
      savedState = {
        htmlOverflow: html.style.overflow,
        bodyPosition: body.style.position,
        bodyTop: body.style.top,
        bodyLeft: body.style.left,
        bodyRight: body.style.right,
        bodyWidth: body.style.width,
        bodyOverflow: body.style.overflow,
        scrollY: window.scrollY,
      };
      html.style.overflow = "hidden";
      body.style.overflow = "hidden";
      body.style.position = "fixed";
      body.style.top = `-${savedState.scrollY}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
    }

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0 && savedState) {
        const state = savedState;
        savedState = null;
        const body = document.body;
        const html = document.documentElement;
        html.style.overflow = state.htmlOverflow;
        body.style.position = state.bodyPosition;
        body.style.top = state.bodyTop;
        body.style.left = state.bodyLeft;
        body.style.right = state.bodyRight;
        body.style.width = state.bodyWidth;
        body.style.overflow = state.bodyOverflow;
        window.scrollTo(0, state.scrollY);
      }
    };
  }, [locked]);
}
