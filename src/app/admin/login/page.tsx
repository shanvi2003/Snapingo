import type { Metadata } from "next";
import Image from "next/image";
import { MonitorSmartphone } from "lucide-react";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin Portal | Snapingo",
  robots: { index: false, follow: false },
};

// Strictly the admin sign-in form, every time this URL is visited - no
// "already logged in, bounce to a dashboard" redirect here. That used to
// fire for ANY existing session regardless of its role, so visiting this
// page while signed in as staff silently dropped the visitor into the
// staff panel instead of ever showing this form. Submitting the form below
// (loginAction) still creates a fresh session and redirects to the right
// panel for whoever just authenticated - this only removes the bounce that
// happened before any credentials were even entered.
export default function LoginPage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-ink-50/60 px-4 py-16">
      {/* The admin panel itself is desktop-only (see PanelShell's own
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
          <p className="mt-1.5 text-sm text-ink-500">Please use a desktop to access the Admin Panel.</p>
        </div>
      </div>

      <div className="hidden w-full max-w-sm rounded-3xl border border-ink-100 bg-white p-8 shadow-soft lg:block">
        <div className="flex flex-col items-center text-center">
          <span className="relative block h-12 w-12">
            <Image src="/snapingo-icon.png" alt="Snapingo" fill sizes="48px" className="object-contain" unoptimized />
          </span>
          <h1 className="mt-4 font-heading text-xl font-bold text-ink-900">Admin Portal</h1>
          <p className="mt-1.5 text-sm text-ink-500">Sign in to the Snapingo admin panel.</p>
        </div>

        <LoginForm portal="ADMIN" />
      </div>
    </section>
  );
}
