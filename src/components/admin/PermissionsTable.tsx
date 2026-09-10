"use client";

import { useActionState, useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, ShieldAlert } from "lucide-react";
import type { StaffJobRole } from "@/generated/prisma/enums";
import { saveRolePermissionsAction, type FormState } from "@/lib/actions/permissions";
import {
  featureDescriptions,
  featureLabels,
  featuresWithViewFallback,
  jobRoleLabels,
  jobRoleOptions,
  staffFeatureGroups,
  type StaffFeature,
} from "@/lib/permissions";

type PermissionsState = Record<StaffJobRole, Set<StaffFeature>>;

function toState(permissions: Record<StaffJobRole, StaffFeature[]>): PermissionsState {
  const state = {} as PermissionsState;
  for (const { value } of jobRoleOptions) {
    state[value] = new Set(permissions[value]);
  }
  return state;
}

function statesEqual(a: PermissionsState, b: PermissionsState): boolean {
  return jobRoleOptions.every(({ value }) => {
    const setA = a[value];
    const setB = b[value];
    return setA.size === setB.size && [...setA].every((f) => setB.has(f));
  });
}

export default function PermissionsTable({
  initialPermissions,
}: {
  initialPermissions: Record<StaffJobRole, StaffFeature[]>;
}) {
  const baseline = useMemo(() => toState(initialPermissions), [initialPermissions]);
  const [state, setState] = useState<PermissionsState>(baseline);
  const [formState, formAction, pending] = useActionState<FormState, FormData>(
    saveRolePermissionsAction,
    undefined
  );

  const dirty = !statesEqual(state, baseline);

  const toggle = (jobRole: StaffJobRole, feature: StaffFeature, checked: boolean) => {
    setState((prev) => {
      const next = { ...prev, [jobRole]: new Set(prev[jobRole]) };
      if (checked) next[jobRole].add(feature);
      else next[jobRole].delete(feature);
      return next;
    });
  };

  const payload = JSON.stringify(
    Object.fromEntries(jobRoleOptions.map(({ value }) => [value, [...state[value]]]))
  );

  return (
    <form action={formAction} className="mt-6">
      <input type="hidden" name="permissions" value={payload} />

      <div className="overflow-x-auto rounded-2xl border border-ink-100 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-ink-100 text-xs font-bold uppercase tracking-wide text-ink-500">
              <th className="min-w-[220px] px-4 py-3">Feature</th>
              {jobRoleOptions.map(({ value, label }) => (
                <th key={value} className="min-w-[150px] px-4 py-3 text-center">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staffFeatureGroups.map((group) => (
              <FeatureGroupRows key={group.heading} heading={group.heading} features={group.features}>
                {(feature) => (
                  <>
                    {jobRoleOptions.map(({ value }) => (
                      <td key={value} className="px-4 py-3 text-center align-middle">
                        <AccessCell
                          jobRole={value}
                          feature={feature}
                          granted={state[value].has(feature)}
                          onChange={(checked) => toggle(value, feature, checked)}
                        />
                      </td>
                    ))}
                  </>
                )}
              </FeatureGroupRows>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-h-[20px] text-sm">
          {formState?.error && (
            <span className="flex items-center gap-1.5 font-medium text-red-600">
              <ShieldAlert className="h-4 w-4" />
              {formState.error}
            </span>
          )}
          {!formState?.error && dirty && (
            <span className="font-medium text-amber-600">You have unsaved changes.</span>
          )}
          {!formState?.error && !dirty && (
            <span className="flex items-center gap-1.5 text-ink-400">
              <CheckCircle2 className="h-4 w-4" />
              Up to date.
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={pending || !dirty}
          className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-brand transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

function FeatureGroupRows({
  heading,
  features,
  children,
}: {
  heading: string;
  features: StaffFeature[];
  children: (feature: StaffFeature) => ReactNode;
}) {
  return (
    <>
      <tr>
        <td
          colSpan={1 + jobRoleOptions.length}
          className="border-b border-ink-100 bg-ink-50/60 px-4 py-2 text-xs font-bold uppercase tracking-wide text-ink-500"
        >
          {heading}
        </td>
      </tr>
      {features.map((feature) => (
        <tr key={feature} className="border-b border-ink-50 last:border-0 hover:bg-ink-50/40">
          <td className="px-4 py-3">
            <p className="font-semibold text-ink-900">{featureLabels[feature]}</p>
            <p className="mt-0.5 text-xs text-ink-500">{featureDescriptions[feature]}</p>
          </td>
          {children(feature)}
        </tr>
      ))}
    </>
  );
}

// Toggle-type features are plain on/off. The four features in
// featuresWithViewFallback (Packages/Destinations/Hotels/Flights) always
// have a permanent read-only reference page for every staff role - this
// checkbox only ever adds *editing* on top of that, so it renders as a
// View/Edit segmented control instead of a bare checkbox to make that floor
// explicit rather than implying "off" means no access at all.
function AccessCell({
  jobRole,
  feature,
  granted,
  onChange,
}: {
  jobRole: StaffJobRole;
  feature: StaffFeature;
  granted: boolean;
  onChange: (checked: boolean) => void;
}) {
  const label = `${granted ? "Revoke" : "Grant"} ${featureLabels[feature]} access for ${jobRoleLabels[jobRole]}`;

  if (featuresWithViewFallback.includes(feature)) {
    return (
      <div className="inline-flex rounded-full border border-ink-200 p-0.5 text-xs font-semibold" role="group" aria-label={label}>
        <button
          type="button"
          onClick={() => onChange(false)}
          aria-pressed={!granted}
          className={`rounded-full px-3 py-1 transition ${
            !granted ? "bg-ink-100 text-ink-700" : "text-ink-400 hover:text-ink-600"
          }`}
        >
          View
        </button>
        <button
          type="button"
          onClick={() => onChange(true)}
          aria-pressed={granted}
          className={`rounded-full px-3 py-1 transition ${
            granted ? "bg-brand-600 text-white" : "text-ink-400 hover:text-ink-600"
          }`}
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <label className="inline-flex cursor-pointer items-center justify-center">
      <input
        type="checkbox"
        checked={granted}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={label}
        className="h-5 w-5 rounded border-ink-300 accent-brand-600"
      />
    </label>
  );
}
