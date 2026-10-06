"use client";

import { useTransition } from "react";
import { assignLeadAction } from "@/lib/actions/admin-leads";
import CustomSelect from "@/components/CustomSelect";

export default function LeadAssignSelect({
  leadId,
  assignedToId,
  staff,
}: {
  leadId: string;
  assignedToId: string | null;
  staff: { id: string; name: string }[];
}) {
  const [pending, startTransition] = useTransition();

  return (
    // Fixed width, like LeadStatusSelect, so the staff menu has room to read.
    <div className={`w-48 ${pending ? "pointer-events-none opacity-60" : ""}`}>
      <CustomSelect
        value={assignedToId ?? ""}
        onChange={(next) => startTransition(() => assignLeadAction(leadId, next || null))}
        placeholder="Unassigned"
        options={[
          { value: "", label: "Unassigned" },
          ...staff.map((s) => ({ value: s.id, label: s.name })),
        ]}
      />
    </div>
  );
}
