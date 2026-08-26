import type { ReactNode } from "react";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";
import PanelNav from "@/components/admin/PanelNav";
import MobilePanelNav from "@/components/admin/MobilePanelNav";

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
  return (
    <div className="flex h-screen overflow-hidden bg-ink-50/60 print:h-auto print:overflow-visible">
      <aside className="print-hide hidden h-full w-64 shrink-0 flex-col border-r border-ink-100 bg-white lg:flex">
        <div className="flex shrink-0 items-center gap-2.5 border-b border-ink-100 px-6 py-5">
          <span className="relative block h-9 w-9">
            <Image src="/snapingo-icon.png" alt="Snapingo" fill sizes="36px" className="object-contain" unoptimized />
          </span>
          <div>
            <p className="font-heading text-base font-bold text-ink-900">Snapingo</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-600">{title}</p>
          </div>
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

      <div className="flex flex-1 flex-col overflow-hidden print:overflow-visible">
        <header className="print-hide flex shrink-0 items-center justify-between border-b border-ink-100 bg-white px-4 py-4 lg:hidden">
          <div className="flex items-center gap-2">
            <span className="relative block h-8 w-8">
              <Image src="/snapingo-icon.png" alt="Snapingo" fill sizes="32px" className="object-contain" unoptimized />
            </span>
            <p className="font-heading text-sm font-bold text-ink-900">{title}</p>
          </div>
          <div className="flex items-center gap-1">
            <form action={logoutAction}>
              <button type="submit" aria-label="Sign out" className="grid h-9 w-9 place-items-center rounded-full text-ink-700 hover:bg-ink-100">
                <LogOut className="h-4 w-4" />
              </button>
            </form>
            <MobilePanelNav sections={sections} rootHref={rootHref} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 print:h-auto print:overflow-visible">{children}</main>
      </div>
    </div>
  );
}
