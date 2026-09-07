"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getMyNotificationsAction, markNotificationsReadAction, type NotificationItem } from "@/lib/actions/notifications";

// Same cadence as PanelShell's AutoRefresh poll - "feels live" without a
// WebSocket/SSE channel, since this is only ever seen by someone with the
// panel open in a tab.
const POLL_MS = 15_000;
const TOAST_MS = 6_000;

type NotificationContextValue = {
  items: NotificationItem[];
  unreadCount: number;
  markAllRead: () => void;
  markOneRead: (id: string) => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within a NotificationProvider");
  return ctx;
}

// A short two-tone chime via the Web Audio API - no external asset/CDN
// needed. Browsers block audio before any user gesture on the page, so this
// can silently no-op on a completely fresh tab; the toast + badge still show.
function playChime() {
  try {
    const AudioContextCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return;
    const ctx = new AudioContextCtor();
    const now = ctx.currentTime;
    [880, 1175].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = now + i * 0.12;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.18, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.3);
    });
    setTimeout(() => ctx.close(), 600);
  } catch {
    // ignore - audio can be blocked by browser autoplay policy
  }
}

// Mounted exactly once per panel (in PanelShell) so polling and the toast
// stack exist a single time even though the bell *button* itself renders
// twice in the markup (desktop sidebar + mobile header, CSS-toggled by
// breakpoint, both always mounted) - without this, each bell instance would
// poll independently and every new lead would chime/toast twice.
export function NotificationProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState<NotificationItem[]>([]);
  const seenIds = useRef<Set<string> | null>(null);

  const poll = useCallback(async () => {
    const { items: freshItems, unreadCount: freshUnread } = await getMyNotificationsAction();

    const previouslySeen = seenIds.current;
    if (previouslySeen) {
      const newOnes = freshItems.filter((n) => !n.read && !previouslySeen.has(n.id));
      if (newOnes.length > 0) {
        setToasts((prev) => [...newOnes, ...prev].slice(0, 4));
        playChime();
        newOnes.forEach((n) => {
          setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== n.id)), TOAST_MS);
        });
      }
    }
    seenIds.current = new Set(freshItems.map((n) => n.id));
    setItems(freshItems);
    setUnreadCount(freshUnread);
  }, []);

  useEffect(() => {
    poll();
    const id = setInterval(poll, POLL_MS);
    return () => clearInterval(id);
  }, [poll]);

  const markAllRead = useCallback(() => {
    setUnreadCount(0);
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    markNotificationsReadAction().catch(() => {});
  }, []);

  const markOneRead = useCallback((id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    markNotificationsReadAction([id]).catch(() => {});
  }, []);

  return (
    <NotificationContext.Provider value={{ items, unreadCount, markAllRead, markOneRead }}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex flex-col gap-2 sm:right-6 sm:top-6">
        <AnimatePresence>
          {toasts.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto w-72 max-w-[85vw] rounded-xl border border-ink-100 bg-white px-4 py-3 shadow-2xl"
            >
              <p className="text-[11px] font-bold uppercase tracking-wide text-brand-600">
                {n.type === "NEW_LEAD" ? "New Lead" : n.type === "LEAD_ASSIGNED" ? "Assigned to You" : "Lead Follow-up"}
              </p>
              <p className="mt-1 text-sm text-ink-900">{n.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  );
}
