"use client";

import { useState, useTransition } from "react";
import { assignLeadAction } from "@/lib/actions/admin-leads";
import CustomSelect from "@/components/CustomSelect";
import { jobRoleLabels, jobRoleOptions } from "@/lib/permissions";
import type { StaffJobRole } from "@/generated/prisma/enums";

// A lead is assigned to one staff member, picked in two steps: the role
// first (every role is listed), then one of the accounts in that role.
// Picking a role on its own assigns nothing - only picking a person does.

export type AssignableStaff = { id: string; name: string; jobRole: StaffJobRole };

export default function LeadAssignSelect({
  leadId,
  assignedRole,
  assignedToId,
  assignedToName,
  staff,
}: {
  leadId: string;
  // Set on leads assigned to a whole role before assignment moved to people.
  assignedRole: StaffJobRole | null;
  assignedToId: string | null;
  assignedToName: string | null;
  staff: AssignableStaff[];
}) {
  const [pending, startTransition] = useTransition();
  const currentRole = staff.find((s) => s.id === assignedToId)?.jobRole ?? assignedRole ?? null;
  const [role, setRole] = useState<StaffJobRole | "">(currentRole ?? "");

  const members = role ? staff.filter((s) => s.jobRole === role) : [];
  // The current assignee may not be in the list (deactivated, or an account
  // without a role) - keep them visible as the selected value.
  const currentMissing = assignedToId && !staff.some((s) => s.id === assignedToId);

  const personOptions = [
    { value: "", label: "Unassigned" },
    ...(currentMissing ? [{ value: assignedToId, label: assignedToName ?? "Current assignee" }] : []),
    ...members.map((s) => ({ value: s.id, label: s.name })),
  ];

  return (
    <div className={`flex gap-2 ${pending ? "pointer-events-none opacity-60" : ""}`}>
      <div className="w-48">
        <CustomSelect
          value={role}
          onChange={(next) => setRole(next as StaffJobRole | "")}
          placeholder="Select role"
          options={jobRoleOptions}
        />
      </div>
      <div className="w-48">
        <CustomSelect
          value={assignedToId ?? ""}
          onChange={(next) => {
            if (next === (assignedToId ?? "")) return;
            startTransition(() => assignLeadAction(leadId, next || null));
          }}
          placeholder={
            !role
              ? "Select role first"
              : members.length === 0
                ? `No ${jobRoleLabels[role]} accounts`
                : "Select person"
          }
          options={role ? personOptions : []}
        />
      </div>
    </div>
  );
}
