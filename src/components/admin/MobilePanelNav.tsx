"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import type { PanelNavSection } from "@/components/admin/PanelShell";
import PanelNav from "@/components/admin/PanelNav";
import { useScrollLock } from "@/hooks/useScrollLock";

export default function MobilePanelNav({ sections, rootHref }: { sections: PanelNavSection[]; rootHref: string }) {
  const [open, setOpen] = useState(false);
  useScrollLock(open);

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
        className="grid h-9 w-9 place-items-center rounded-full text-ink-700 hover:bg-ink-100"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-ink-950/50" onClick={() => setOpen(false)} />
          <div className="relative flex w-72 max-w-[80vw] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-ink-100 px-5 py-4">
              <p className="font-heading text-sm font-bold text-ink-900">Menu</p>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-ink-700 hover:bg-ink-100"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <PanelNav sections={sections} rootHref={rootHref} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
