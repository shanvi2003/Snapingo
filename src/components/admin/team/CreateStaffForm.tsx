"use client";

import { useActionState, useRef, useState } from "react";
import { createStaffAction, type FormState } from "@/lib/actions/team";
import { jobRoleOptions } from "@/lib/permissions";
import CustomSelect from "@/components/CustomSelect";

const inputClass =
  "w-full rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm text-ink-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-900";

// This form only ever creates STAFF accounts - role is fixed, not a choice,
// so there's nothing here that could accidentally create a new Admin.
export default function CreateStaffForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [jobRole, setJobRole] = useState("");
  const [state, action, pending] = useActionState<FormState, FormData>(async (prevState, formData) => {
    const result = await createStaffAction(prevState, formData);
    if (!result) {
      formRef.current?.reset();
      setJobRole("");
    }
    return result;
  }, undefined);

  return (
    <form ref={formRef} action={action} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <input type="hidden" name="role" value="STAFF" />
      <div>
        <label className={labelClass} htmlFor="name">Name</label>
        <input id="name" name="name" required className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="password">Temporary Password</label>
        <input id="password" name="password" type="text" required minLength={8} className={inputClass} />
      </div>
      <div>
        <label className={labelClass} htmlFor="jobRole">Job Role</label>
        <CustomSelect
          name="jobRole"
          value={jobRole}
          onChange={setJobRole}
          placeholder="Select job role"
          options={jobRoleOptions}
        />
      </div>

      {state?.error && (
        <p className="sm:col-span-2 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">{state.error}</p>
      )}

      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "Creating..." : "Create Account"}
        </button>
      </div>
    </form>
  );
}
