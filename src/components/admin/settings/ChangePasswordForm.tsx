"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { changePasswordAction } from "@/lib/actions/settings";

const inputClass =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 pr-11 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-900";

function PasswordField({
  id,
  name,
  label,
  autoComplete,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label className={labelClass} htmlFor={id}>{label}</label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={visible ? "text" : "password"}
          required
          autoComplete={autoComplete}
          className={inputClass}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 transition hover:text-ink-700"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export default function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePasswordAction, undefined);

  return (
    <form action={action} className="mt-4 max-w-md space-y-4">
      <PasswordField id="currentPassword" name="currentPassword" label="Current Password" autoComplete="current-password" />
      <PasswordField id="newPassword" name="newPassword" label="New Password" autoComplete="new-password" />
      <PasswordField id="confirmPassword" name="confirmPassword" label="Confirm New Password" autoComplete="new-password" />

      {state && "error" in state && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">{state.error}</p>
      )}
      {state && "success" in state && (
        <p className="rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">{state.success}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}
