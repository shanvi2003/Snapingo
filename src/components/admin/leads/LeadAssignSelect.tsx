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
    <div className={pending ? "pointer-events-none opacity-60" : undefined}>
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
