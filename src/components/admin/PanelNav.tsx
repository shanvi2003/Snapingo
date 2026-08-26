"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { PanelNavSection } from "@/components/admin/PanelShell";

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function PanelNav({
  sections,
  rootHref,
  onNavigate,
}: {
  sections: PanelNavSection[];
  rootHref: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  // Sections start expanded; only sections with a heading get a toggle at all.
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <nav className="flex-1 space-y-4 px-3 py-5">
      {sections.map((section, i) => {
        const key = section.heading ?? String(i);
        const isCollapsed = Boolean(section.heading) && collapsed[key];
        return (
          <div key={key}>
            {section.heading && (
              <button
                type="button"
                onClick={() => setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }))}
                aria-expanded={!isCollapsed}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wider text-ink-500 transition hover:bg-ink-50 hover:text-ink-700"
              >
                <span>{section.heading}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`}
                />
              </button>
            )}
            <AnimatePresence initial={false}>
              {!isCollapsed && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const active = isActive(pathname, item.href, item.href === rootHref);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onNavigate}
                          aria-current={active ? "page" : undefined}
                          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                            active ? "bg-brand-50 text-brand-700" : "text-ink-700 hover:bg-ink-50 hover:text-brand-700"
                          }`}
                        >
                          <span className={`h-4.5 w-4.5 ${active ? "text-brand-600" : "text-ink-400"}`}>{item.icon}</span>
                          <span className="flex-1">{item.label}</span>
                          {Boolean(item.badge) && (
                            <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-brand-600 px-1.5 text-[11px] font-bold text-white">
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </nav>
  );
}
