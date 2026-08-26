import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireStaffFeature } from "@/lib/dal";
import { LeadSource, LeadStatus } from "@/generated/prisma/client";
import { sourceLabels, statusLabels } from "@/components/admin/leads/statusStyles";

function csvEscape(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(request: NextRequest) {
  await requireStaffFeature("leads");

  const { searchParams } = new URL(request.url);
  const source = searchParams.get("source");
  const status = searchParams.get("status");

  const leads = await db.lead.findMany({
    where: {
      ...(source ? { source: source as LeadSource } : {}),
      ...(status ? { status: status as LeadStatus } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 5000,
  });

  const header = ["Name", "Phone", "Email", "Source", "Status", "Destination", "Message", "Created At"];
  const rows = leads.map((l) =>
    [
      l.name,
      l.phone,
      l.email,
      sourceLabels[l.source],
      statusLabels[l.status],
      l.destinationName,
      l.message,
      l.createdAt.toISOString(),
    ]
      .map(csvEscape)
      .join(",")
  );
  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="snapingo-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
