"use client";

import { useState, useTransition } from "react";
import { KeyRound } from "lucide-react";
import { toggleStaffActiveAction, resetStaffPasswordAction, updateStaffJobRoleAction } from "@/lib/actions/team";
import { jobRoleOptions } from "@/lib/permissions";
import type { StaffJobRole } from "@/generated/prisma/enums";
import CustomSelect from "@/components/CustomSelect";

export default function StaffRow({
  id,
  name,
  email,
  role,
  jobRole,
  isActive,
  isSelf,
}: {
  id: string;
  name: string;
  email: string;
  role: string;
  jobRole: StaffJobRole | null;
  isActive: boolean;
  isSelf: boolean;
}) {
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [jobRolePending, startJobRoleTransition] = useTransition();

  return (
    <tr className="border-b border-ink-50 last:border-0 hover:bg-ink-50/60">
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-50 text-sm font-bold text-brand-600">
            {name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-ink-900">
              {name} {isSelf && <span className="text-xs font-normal text-ink-400">(you)</span>}
            </p>
            <p className="truncate text-xs text-ink-500">{email}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
            role === "ADMIN" ? "bg-brand-50 text-brand-700" : "bg-ink-100 text-ink-700"
          }`}
        >
          {role.toLowerCase()}
        </span>
        {role === "STAFF" && (
          <div className={`mt-2 w-full max-w-44 ${jobRolePending ? "pointer-events-none opacity-60" : ""}`}>
            <CustomSelect
              value={jobRole ?? ""}
              onChange={(next) => startJobRoleTransition(() => updateStaffJobRoleAction(id, next as StaffJobRole))}
              placeholder="Pick job role"
              options={jobRoleOptions}
            />
          </div>
        )}
      </td>
      <td className="px-4 py-4">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${isActive ? "bg-emerald-50 text-emerald-700" : "bg-ink-100 text-ink-500"}`}>
          {isActive ? "Active" : "Deactivated"}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <button
            type="button"
            disabled={isSelf || pending}
            onClick={() => startTransition(() => toggleStaffActiveAction(id, !isActive))}
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isActive ? "Deactivate" : "Activate"}
          </button>
          <button
            type="button"
            onClick={() => {
              setResetError(null);
              setResetting((v) => !v);
            }}
            className="flex items-center gap-1 text-xs font-semibold text-ink-600 hover:text-brand-600"
          >
            <KeyRound className="h-3 w-3" />
            Reset Password
          </button>
        </div>
        {resetting && (
          <>
            <form
              action={async (formData) => {
                const result = await resetStaffPasswordAction(formData);
                if (result?.error) {
                  setResetError(result.error);
                } else {
                  setResetError(null);
                  setResetting(false);
                }
              }}
              className="mt-2 flex items-center gap-2"
            >
              <input type="hidden" name="userId" value={id} />
              <input
                name="password"
                type="text"
                required
                minLength={8}
                placeholder="New password"
                className="w-40 rounded-lg border border-ink-200 bg-white px-2.5 py-1.5 text-xs text-ink-900 focus:border-brand-500 focus:outline-none"
              />
              <button type="submit" className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700">
                Save
              </button>
            </form>
            {resetError && <p className="mt-1 text-xs font-medium text-red-600">{resetError}</p>}
          </>
        )}
      </td>
    </tr>
  );
}
