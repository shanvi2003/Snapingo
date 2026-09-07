"use server";

import { headers } from "next/headers";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { createLeadSchema, type CreateLeadInput } from "@/lib/validation/lead";
import { logLeadActivity } from "@/lib/leadActivity";
import { sourceLabels } from "@/components/admin/leads/statusStyles";
import { checkRateLimit, clientIpFrom } from "@/lib/rateLimit";
import { notifyLeadAssigned, notifyLeadFollowup, notifyNewLead } from "@/lib/notifications";

// Public form spam/DoS guard: this is a single anonymous action shared by
// every lead touchpoint (contact form, trip planner, hotel/flight/cab
// modals), so the limit is generous enough for someone genuinely filling out
// several of those in one visit while still stopping a scripted flood.
const LEAD_LIMIT = 8;
const LEAD_WINDOW_MS = 60_000;

// If the same phone or email submits again within this window, it's the
// same visitor filling out a second popup (or resubmitting) - fold that
// into the existing lead's activity feed instead of spawning a duplicate
// "New" row a salesperson would have to notice and dedupe by hand.
const DUPLICATE_WINDOW_MS = 48 * 60 * 60 * 1000;

// Only staff whose jobRole actually grants the "leads" feature (see
// src/lib/permissions.ts) are eligible for auto-assignment - assigning to a
// Social Media/Digital Marketing account would just leave the lead
// invisible to them until an admin manually reassigned it.
const LEAD_ELIGIBLE_JOB_ROLES = ["TRAVEL_EXECUTIVE", "BDE"] as const;
const OPEN_LEAD_STATUSES = ["NEW", "CONTACTED"] as const;

// Picks whichever eligible, active salesperson currently has the fewest
// open (NEW/CONTACTED) leads on their plate - a load-based hand-off rather
// than a fixed round-robin pointer, so it naturally rebalances if someone's
// queue backs up. Returns null (leaving the lead unassigned) if there's no
// eligible staff yet, e.g. a fresh install with no Travel Executive/BDE
// accounts created.
async function pickLeastLoadedStaffId(): Promise<string | null> {
  const eligibleStaff = await db.staffUser.findMany({
    where: { isActive: true, jobRole: { in: [...LEAD_ELIGIBLE_JOB_ROLES] } },
    select: { id: true },
  });
  if (eligibleStaff.length === 0) return null;

  const loadCounts = await db.lead.groupBy({
    by: ["assignedToId"],
    where: {
      assignedToId: { in: eligibleStaff.map((s) => s.id) },
      status: { in: [...OPEN_LEAD_STATUSES] },
    },
    _count: { _all: true },
  });
  const loadById = new Map(loadCounts.map((row) => [row.assignedToId, row._count._all]));

  let picked = eligibleStaff[0].id;
  let lowestLoad = loadById.get(picked) ?? 0;
  for (const staff of eligibleStaff) {
    const load = loadById.get(staff.id) ?? 0;
    if (load < lowestLoad) {
      lowestLoad = load;
      picked = staff.id;
    }
  }
  return picked;
}

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

    const { name, phone, email, source, destinationName } = parsed.data;

    const duplicate = await db.lead.findFirst({
      where: {
        OR: [{ phone }, { email }],
        createdAt: { gte: new Date(Date.now() - DUPLICATE_WINDOW_MS) },
      },
      orderBy: { createdAt: "desc" },
    });

    if (duplicate) {
      const detail = destinationName ? ` — ${destinationName}` : "";
      await logLeadActivity(
        duplicate.id,
        "NOTE_ADDED",
        `${name} submitted another enquiry (${sourceLabels[source]}${detail})`
      );
      if (duplicate.assignedToId) {
        await notifyLeadFollowup({
          leadId: duplicate.id,
          staffId: duplicate.assignedToId,
          who: name,
          sourceLabel: sourceLabels[source],
          destinationName,
        });
      }
      return { ok: true };
    }

    const assignedToId = await pickLeastLoadedStaffId();

    const lead = await db.lead.create({
      data: {
        ...parsed.data,
        raw: parsed.data.raw as Prisma.InputJsonValue | undefined,
        userAgent: headerList.get("user-agent") ?? undefined,
        assignedToId: assignedToId ?? undefined,
      },
    });
    await logLeadActivity(lead.id, "CREATED", `${name} submitted a ${sourceLabels[lead.source]} enquiry`);
    await notifyNewLead({ leadId: lead.id, who: name, sourceLabel: sourceLabels[lead.source], destinationName });

    if (assignedToId) {
      const assignee = await db.staffUser.findUnique({ where: { id: assignedToId }, select: { name: true } });
      if (assignee) {
        await logLeadActivity(lead.id, "ASSIGNED", `Auto-assigned to ${assignee.name} (least loaded)`);
        await notifyLeadAssigned({
          leadId: lead.id,
          staffId: assignedToId,
          who: name,
          sourceLabel: sourceLabels[lead.source],
          destinationName,
        });
      }
    }

    return { ok: true };
  } catch (err) {
    console.error("createLeadAction: failed to save lead", err);
    return { ok: false };
  }
}
