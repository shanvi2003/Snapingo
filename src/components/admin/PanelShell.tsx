import type { ReactNode } from "react";
import Image from "next/image";
import { LogOut, MonitorSmartphone } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import PanelNav from "@/components/admin/PanelNav";
import AutoRefresh from "@/components/admin/AutoRefresh";
import NotificationBell from "@/components/admin/NotificationBell";
import { NotificationProvider } from "@/components/admin/NotificationCenter";

export type PanelNavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: number;
};

export type PanelNavSection = {
  heading?: string;
  items: PanelNavItem[];
};

export default function PanelShell({
  title,
  rootHref,
  sections,
  children,
}: {
  title: string;
  rootHref: string;
  sections: PanelNavSection[];
  children: ReactNode;
}) {
  const leadsBasePath = `${rootHref}/leads`;

  return (
    <NotificationProvider>
      <div className="flex h-screen overflow-hidden bg-ink-50/60 print:h-auto print:overflow-visible">
        <AutoRefresh />
        <aside className="print-hide hidden h-full w-64 shrink-0 flex-col border-r border-ink-100 bg-white lg:flex">
          <div className="flex shrink-0 items-center gap-2.5 border-b border-ink-100 px-6 py-5">
            <span className="relative block h-9 w-9">
              <Image src="/snapingo-icon.png" alt="Snapingo" fill sizes="36px" className="object-contain" unoptimized />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-heading text-base font-bold text-ink-900">Snapingo</p>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-600">{title}</p>
            </div>
            <NotificationBell leadsBasePath={leadsBasePath} align="left" />
          </div>

          <div className="flex-1 overflow-y-auto">
            <PanelNav sections={sections} rootHref={rootHref} />
          </div>

          <div className="shrink-0 border-t border-ink-100 p-4">
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-700 transition hover:bg-ink-100"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          </div>
        </aside>

        {/* Below lg: the panel's dense nav (20+ links across sections) and
            data-heavy tables/forms are built for a laptop/desktop's room,
            not a phone screen - rather than maintain a second, cut-down
            responsive layout for every panel page, this asks the visitor to
            switch devices instead. print:flex overrides this at print time
            regardless of the rendering window's width, since printing (an
            invoice, itinerary, etc.) should never be blocked by it. */}
        <div className="hidden flex-1 flex-col overflow-hidden lg:flex print:flex print:overflow-visible">
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 print:h-auto print:overflow-visible">{children}</main>
        </div>

        <div className="print-hide flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center lg:hidden">
          <span className="relative block h-11 w-11">
            <Image src="/snapingo-icon.png" alt="Snapingo" fill sizes="44px" className="object-contain" unoptimized />
          </span>
          <MonitorSmartphone className="h-10 w-10 text-ink-300" aria-hidden />
          <div>
            <h1 className="font-heading text-lg font-bold text-ink-900">Desktop Only</h1>
            <p className="mt-1.5 max-w-xs text-sm text-ink-500">
              Please use a desktop to access the {title}.
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="flex items-center gap-1.5 text-sm font-semibold text-ink-500 transition hover:text-ink-700"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </NotificationProvider>
  );
}
