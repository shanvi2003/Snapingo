import type { Metadata } from "next";
import Image from "next/image";
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
      <div className="w-full max-w-sm rounded-3xl border border-ink-100 bg-white p-8 shadow-soft">
        <div className="flex flex-col items-center text-center">
          <span className="relative block h-12 w-12">
            <Image src="/snapingo-icon.png" alt="Snapingo" fill sizes="48px" className="object-contain" unoptimized />
          </span>
          <h1 className="mt-4 font-heading text-xl font-bold text-ink-900">Staff Portal</h1>
          <p className="mt-1.5 text-sm text-ink-500">Sign in to the Snapingo staff panel.</p>
        </div>

        <LoginForm />
      </div>
    </section>
  );
}
