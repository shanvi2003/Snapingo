"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Bell } from "lucide-react";
import { useNotifications } from "@/components/admin/NotificationCenter";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// The button + dropdown only - polling and the toast stack live once in
// NotificationProvider (see NotificationCenter.tsx). This renders twice in
// PanelShell (desktop sidebar + mobile header), both reading the same
// shared state via context so they never drift or double-fire.
//
// `align` controls which side the dropdown expands from, since the two
// placements have very different room around them: in the 256px-wide
// desktop sidebar the bell sits near the sidebar's own right edge, so a
// right-aligned (`right-0`) dropdown wider than the sidebar itself overflows
// past the screen's left edge and gets clipped - it needs to expand
// rightward (`left-0`) into the spacious main content area instead. The
// mobile header spans the full viewport with the bell near its right side,
// where the opposite (`right-0`, expanding left) is what actually stays
// on-screen.
export default function NotificationBell({
  leadsBasePath,
  align = "right",
}: {
  leadsBasePath: string;
  align?: "left" | "right";
}) {
  const { items, unreadCount, markAllRead, markOneRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const handleToggle = () => {
    const opening = !open;
    setOpen(opening);
    if (opening && unreadCount > 0) markAllRead();
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notifications"
        className="relative grid h-9 w-9 place-items-center rounded-full text-ink-700 transition hover:bg-ink-100"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 mt-2 w-80 max-w-[85vw] overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-2xl ${
              align === "left" ? "left-0" : "right-0"
            }`}
          >
            <div className="border-b border-ink-100 px-4 py-3">
              <p className="text-sm font-bold text-ink-900">Notifications</p>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-ink-500">No notifications yet.</p>
              ) : (
                items.map((n) => (
                  <Link
                    key={n.id}
                    href={n.leadId ? `${leadsBasePath}/${n.leadId}` : leadsBasePath}
                    onClick={() => {
                      setOpen(false);
                      if (!n.read) markOneRead(n.id);
                    }}
                    className={`block border-b border-ink-50 px-4 py-3 text-sm transition hover:bg-ink-50 last:border-b-0 ${
                      n.read ? "text-ink-600" : "bg-brand-50/60 font-medium text-ink-900"
                    }`}
                  >
                    <p className="leading-snug">{n.message}</p>
                    <p className="mt-1 text-xs text-ink-400">{timeAgo(n.createdAt)}</p>
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
