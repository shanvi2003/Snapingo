"use client";

import { useTransition } from "react";
import { updateLeadStatusAction } from "@/lib/actions/admin-leads";
// Deliberately from generated/prisma/enums, not .../client - the client
// module pulls in Node-only internals (fine server-side) that break the
// browser bundle if imported from a "use client" file. enums.ts is pure
// plain-object exports, safe on both sides of the boundary.
import { LeadStatus } from "@/generated/prisma/enums";
import { statusLabels } from "@/components/admin/leads/statusStyles";
import CustomSelect from "@/components/CustomSelect";

export default function LeadStatusSelect({ leadId, status }: { leadId: string; status: LeadStatus }) {
  const [pending, startTransition] = useTransition();

  return (
    <div className={pending ? "pointer-events-none opacity-60" : undefined}>
      <CustomSelect
        value={status}
        onChange={(next) => startTransition(() => updateLeadStatusAction(leadId, next as LeadStatus))}
        options={Object.values(LeadStatus).map((s) => ({ value: s, label: statusLabels[s] }))}
      />
    </div>
  );
}
