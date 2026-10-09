import "server-only";
import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { resolveContentBlocks } from "@/lib/contentBlocks";
import { getSession } from "@/lib/dal";
import { jobRoleLabels } from "@/lib/permissions";
import type { CustomPackageDefaults } from "@/components/admin/customPackages/CustomPackageForm";

// <input type="date"> only accepts yyyy-mm-dd, and toISOString() would shift
// the day backwards for anyone east of UTC (which is everyone here) - so the
// date is formatted from its local parts instead.
export function toDateInput(value: Date | null): string | undefined {
  if (!value) return undefined;
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const withRows = { days: { orderBy: { day: "asc" } }, stays: { orderBy: { order: "asc" } } } as const;

type QuotationWithRows = Prisma.CustomPackageGetPayload<{ include: typeof withRows }>;

export function loadQuotation(id: string): Promise<QuotationWithRows | null> {
  return db.customPackage.findUnique({ where: { id }, include: withRows });
}

/** A saved quotation as the quotation form's starting values. */
export async function defaultsFromQuotation(quotation: QuotationWithRows): Promise<CustomPackageDefaults> {
  const blocks = await resolveContentBlocks(quotation.contentBlocks);
  return {
    id: quotation.id,
    customerName: quotation.customerName,
    customerPhone: quotation.customerPhone ?? undefined,
    customerEmail: quotation.customerEmail ?? undefined,
    leadId: quotation.leadId ?? undefined,
    tripType: quotation.tripType ?? undefined,
    destinationName: quotation.destinationName,
    startDate: toDateInput(quotation.startDate),
    endDate: toDateInput(quotation.endDate),
    durationNights: quotation.durationNights,
    durationDays: quotation.durationDays,
    adults: quotation.adults,
    children: quotation.children,
    infants: quotation.infants,
    childAges: quotation.childAges,
    rooms: quotation.rooms,
    extraBeds: quotation.extraBeds,
    extraMattresses: quotation.extraMattresses,
    roomCategory: quotation.roomCategory ?? undefined,
    roomCategoryOther: quotation.roomCategoryOther ?? undefined,
    hotelCategory: quotation.hotelCategory ?? undefined,
    inclusions: quotation.inclusions,
    customInclusions: quotation.customInclusions,
    exclusions: quotation.exclusions,
    vehicleName: quotation.vehicleName ?? undefined,
    price: quotation.price,
    notes: quotation.notes ?? undefined,
    preparedByName: quotation.preparedByName ?? undefined,
    preparedByRole: quotation.preparedByRole ?? undefined,
    contentBlocks: blocks.map((b) => ({ key: b.key, title: b.title, body: b.body })),
    days: quotation.days.map((d) => ({
      date: toDateInput(d.date) ?? "",
      title: d.title,
      desc: d.desc,
    })),
    stays: quotation.stays.map((s) => ({
      city: s.city ?? "",
      hotelName: s.hotelName,
      nights: s.nights != null ? String(s.nights) : "",
      days: s.days != null ? String(s.days) : "",
    })),
  };
}

/**
 * The signed-in staff member as a quotation's "Prepared By": their name, and
 * their job role (or "Admin"), as staff read it.
 */
export async function currentPreparer(): Promise<{ preparedByName?: string; preparedByRole?: string }> {
  const session = await getSession();
  if (!session) return {};
  const user = await db.staffUser.findUnique({
    where: { id: session.userId },
    select: { name: true, role: true, jobRole: true },
  });
  if (!user) return {};
  const role = user.role === "ADMIN" ? "Admin" : user.jobRole ? jobRoleLabels[user.jobRole] : "Staff";
  return { preparedByName: user.name, preparedByRole: role };
}
