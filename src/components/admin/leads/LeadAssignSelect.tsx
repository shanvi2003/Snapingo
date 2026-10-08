"use client";

import { useTransition } from "react";
import { assignLeadRoleAction } from "@/lib/actions/admin-leads";
import CustomSelect from "@/components/CustomSelect";
import { jobRoleOptions } from "@/lib/permissions";
import type { StaffJobRole } from "@/generated/prisma/enums";

// Leads are assigned to a team (job role). A lead the website auto-assigned
// to one staff member shows that person until a role is picked.
const PERSON = "person";

export default function LeadAssignSelect({
  leadId,
  assignedRole,
  assignedToName,
}: {
  leadId: string;
  assignedRole: StaffJobRole | null;
  assignedToName: string | null;
}) {
  const [pending, startTransition] = useTransition();

  return (
    // Fixed width, like LeadStatusSelect, so the role names have room to read.
    <div className={`w-56 ${pending ? "pointer-events-none opacity-60" : ""}`}>
      <CustomSelect
        value={assignedRole ?? (assignedToName ? PERSON : "")}
        onChange={(next) => {
          if (next === PERSON) return;
          startTransition(() => assignLeadRoleAction(leadId, (next || null) as StaffJobRole | null));
        }}
        placeholder="Unassigned"
        options={[
          { value: "", label: "Unassigned" },
          ...(assignedToName && !assignedRole ? [{ value: PERSON, label: assignedToName }] : []),
          ...jobRoleOptions,
        ]}
      />
    </div>
  );
}
