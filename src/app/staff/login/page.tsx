import type { Metadata } from "next";
import Image from "next/image";
import { MonitorSmartphone } from "lucide-react";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Staff Portal | Snapingo",
  robots: { index: false, follow: false },
};

// Strictly the staff sign-in form, every time this URL is visited - see
// the matching comment in admin/login/page.tsx for why the old
// "already logged in, bounce to a dashboard" redirect was removed (it
// fired for ANY session regardless of role, so visiting this page while
// signed in as admin silently dropped the visitor into the admin panel
// instead of ever showing this form).
export default function StaffLoginPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-ink-50/60 px-4 py-16">
      {/* The staff panel itself is desktop-only (see PanelShell's own
          "Desktop Only" screen) - showing the sign-in form on a phone would
          let someone log in only to be blocked right after, for no reason.
          This mirrors that message before any credentials are entered,
          instead of the login form, on the same lg breakpoint. */}
      <div className="flex w-full max-w-sm flex-col items-center gap-4 text-center lg:hidden">
        <span className="relative block h-11 w-11">
          <Image src="/snapingo-icon.png" alt="Snapingo" fill sizes="44px" className="object-contain" unoptimized />
        </span>
        <MonitorSmartphone className="h-10 w-10 text-ink-300" aria-hidden />
        <div>
          <h1 className="font-heading text-lg font-bold text-ink-900">Desktop Only</h1>
          <p className="mt-1.5 text-sm text-ink-500">Please use a desktop to access the Staff Panel.</p>
        </div>
      </div>

      <div className="hidden w-full max-w-sm rounded-3xl border border-ink-100 bg-white p-8 shadow-soft lg:block">
        <div className="flex flex-col items-center text-center">
          <span className="relative block h-12 w-12">
            <Image src="/snapingo-icon.png" alt="Snapingo" fill sizes="48px" className="object-contain" unoptimized />
          </span>
          <h1 className="mt-4 font-heading text-xl font-bold text-ink-900">Staff Portal</h1>
          <p className="mt-1.5 text-sm text-ink-500">Sign in to the Snapingo staff panel.</p>
        </div>

        <LoginForm portal="STAFF" />
      </div>
    </section>
  );
}
