"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { createLeadSchema, type CreateLeadInput } from "@/lib/validation/lead";
import { logLeadActivity } from "@/lib/leadActivity";
import { sourceLabels } from "@/components/admin/leads/statusStyles";
import { checkRateLimit, clientIpFrom } from "@/lib/rateLimit";

// Public form spam/DoS guard: this is a single anonymous action shared by
// every lead touchpoint (contact form, trip planner, hotel/flight/cab
// modals), so the limit is generous enough for someone genuinely filling out
// several of those in one visit while still stopping a scripted flood.
const LEAD_LIMIT = 8;
const LEAD_WINDOW_MS = 60_000;

// The one Server Action every form/booking touchpoint on the public site
// calls. Public and unauthenticated on purpose (lead forms are meant to be
// filled by anonymous visitors) — the zod schema above is the trust
// boundary, not a session check. Called fire-and-forget from client
// components alongside the existing WhatsApp `window.open`, so a bad
// input here must never throw past the caller and break that redirect.
export async function createLeadAction(input: CreateLeadInput): Promise<{ ok: boolean }> {
  const parsed = createLeadSchema.safeParse(input);
  if (!parsed.success) {
    console.warn("createLeadAction: invalid input", parsed.error.flatten());
    return { ok: false };
  }

  try {
    const headerList = await headers();

    const ip = clientIpFrom(headerList);
    if (!checkRateLimit(`lead:${ip}`, LEAD_LIMIT, LEAD_WINDOW_MS)) {
      console.warn("createLeadAction: rate limited", { ip });
      return { ok: false };
    }

    const lead = await db.lead.create({
      data: {
        ...parsed.data,
        raw: parsed.data.raw as Prisma.InputJsonValue | undefined,
        userAgent: headerList.get("user-agent") ?? undefined,
      },
    });
    const who = lead.name || lead.phone || lead.email || "Someone";
    await logLeadActivity(lead.id, "CREATED", `${who} submitted a ${sourceLabels[lead.source]} enquiry`);
    return { ok: true };
  } catch (err) {
    console.error("createLeadAction: failed to save lead", err);
    return { ok: false };
  }
}
