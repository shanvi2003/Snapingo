import type { Metadata } from "next";
import Image from "next/image";
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
      <div className="w-full max-w-sm rounded-3xl border border-ink-100 bg-white p-8 shadow-soft">
        <div className="flex flex-col items-center text-center">
          <span className="relative block h-12 w-12">
            <Image src="/snapingo-icon.png" alt="Snapingo" fill sizes="48px" className="object-contain" unoptimized />
          </span>
          <h1 className="mt-4 font-heading text-xl font-bold text-ink-900">Admin Portal</h1>
          <p className="mt-1.5 text-sm text-ink-500">Sign in to the Snapingo admin panel.</p>
        </div>

        <LoginForm />
      </div>
    </section>
  );
}
