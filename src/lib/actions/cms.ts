"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireSession, requireStaffFeature } from "@/lib/dal";
import type { SessionPayload } from "@/lib/session";
import {
  packageSchema,
  destinationSchema,
  serviceSchema,
  blogPostSchema,
  hotelSchema,
  flightSchema,
  faqItemSchema,
} from "@/lib/validation/cms";

export type FormState = { error: string } | undefined;

// Hotels/Flights stay Admin-only - no staff jobRole grants edit access to
// them (see src/lib/permissions.ts), only the read-only /staff/hotels and
// /staff/flights browse pages.
async function requireAdmin() {
  return requireSession(["ADMIN"]);
}

// Packages/Destinations/Services/FAQ: Admin + Digital Marketing (contentEdit).
async function requireContentEditor() {
  return requireStaffFeature("contentEdit");
}

// Blog: Admin + Social Media Executive (blogEdit).
async function requireBlogEditor() {
  return requireStaffFeature("blogEdit");
}

function basePathFor(session: SessionPayload): string {
  return session.role === "ADMIN" ? "/admin" : "/staff";
}

function parse(formData: FormData) {
  const raw = Object.fromEntries(formData.entries());
  return { ...raw, categories: formData.getAll("categories"), inclusions: formData.getAll("inclusions") };
}

// ---------------------------------------------------------------------------
// Packages
// ---------------------------------------------------------------------------

export async function savePackageAction(isNew: boolean, _prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await requireContentEditor();
  const parsed = packageSchema.safeParse(parse(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const { id, itinerary, ...data } = parsed.data;

  if (isNew) {
    const existing = await db.package.findUnique({ where: { id } });
    if (existing) return { error: "A package with this ID already exists." };
    await db.package.create({ data: { id, ...data, itinerary: { create: itinerary } } });
  } else {
    await db.package.update({
      where: { id },
      data: { ...data, itinerary: { deleteMany: {}, create: itinerary } },
    });
  }

  revalidatePath("/admin/cms/packages");
  revalidatePath("/staff/cms/packages");
  revalidatePath("/packages");
  revalidatePath(`/packages/${id}`);
  redirect(`${basePathFor(session)}/cms/packages`);
}

export async function deletePackageAction(id: string): Promise<void> {
  await requireContentEditor();
  await db.package.delete({ where: { id } });
  revalidatePath("/admin/cms/packages");
  revalidatePath("/staff/cms/packages");
  revalidatePath("/packages");
}

// ---------------------------------------------------------------------------
// Destinations
// ---------------------------------------------------------------------------

export async function saveDestinationAction(isNew: boolean, _prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await requireContentEditor();
  const parsed = destinationSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const { slug, highlights, ...data } = parsed.data;

  if (isNew) {
    const existing = await db.destination.findUnique({ where: { slug } });
    if (existing) return { error: "A destination with this slug already exists." };
    await db.destination.create({ data: { slug, ...data, highlights: { create: highlights } } });
  } else {
    await db.destination.update({
      where: { slug },
      data: { ...data, highlights: { deleteMany: {}, create: highlights } },
    });
  }

  revalidatePath("/admin/cms/destinations");
  revalidatePath("/staff/cms/destinations");
  revalidatePath("/destinations");
  revalidatePath(`/destinations/${slug}`);
  redirect(`${basePathFor(session)}/cms/destinations`);
}

export async function deleteDestinationAction(slug: string): Promise<void> {
  await requireContentEditor();
  await db.destination.delete({ where: { slug } });
  revalidatePath("/admin/cms/destinations");
  revalidatePath("/staff/cms/destinations");
  revalidatePath("/destinations");
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

export async function saveServiceAction(isNew: boolean, _prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await requireContentEditor();
  const parsed = serviceSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const { slug, highlights, ...data } = parsed.data;

  if (isNew) {
    const existing = await db.service.findUnique({ where: { slug } });
    if (existing) return { error: "A service with this slug already exists." };
    await db.service.create({ data: { slug, ...data, highlights: { create: highlights } } });
  } else {
    await db.service.update({
      where: { slug },
      data: { ...data, highlights: { deleteMany: {}, create: highlights } },
    });
  }

  revalidatePath("/admin/cms/services");
  revalidatePath("/staff/cms/services");
  revalidatePath("/services");
  revalidatePath(`/services/${slug}`);
  redirect(`${basePathFor(session)}/cms/services`);
}

// ---------------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------------

export async function saveBlogPostAction(isNew: boolean, _prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await requireBlogEditor();
  const parsed = blogPostSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const { id, content, ...data } = parsed.data;

  if (isNew) {
    const existing = await db.blogPost.findUnique({ where: { id } });
    if (existing) return { error: "A blog post with this ID already exists." };
    await db.blogPost.create({ data: { id, ...data, content: { create: content } } });
  } else {
    await db.blogPost.update({
      where: { id },
      data: { ...data, content: { deleteMany: {}, create: content } },
    });
  }

  revalidatePath("/admin/cms/blog");
  revalidatePath("/staff/cms/blog");
  revalidatePath("/blog");
  revalidatePath(`/blog/${id}`);
  redirect(`${basePathFor(session)}/cms/blog`);
}

export async function deleteBlogPostAction(id: string): Promise<void> {
  await requireBlogEditor();
  await db.blogPost.delete({ where: { id } });
  revalidatePath("/admin/cms/blog");
  revalidatePath("/staff/cms/blog");
  revalidatePath("/blog");
}

// ---------------------------------------------------------------------------
// Hotels (Admin only)
// ---------------------------------------------------------------------------

export async function saveHotelAction(isNew: boolean, _prevState: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = hotelSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const { id, ...data } = parsed.data;

  if (isNew) {
    const existing = await db.hotel.findUnique({ where: { id } });
    if (existing) return { error: "A hotel with this ID already exists." };
    await db.hotel.create({ data: { id, ...data } });
  } else {
    await db.hotel.update({ where: { id }, data });
  }

  revalidatePath("/admin/cms/hotels");
  revalidatePath("/staff/hotels");
  redirect("/admin/cms/hotels");
}

export async function deleteHotelAction(id: string): Promise<void> {
  await requireAdmin();
  await db.hotel.delete({ where: { id } });
  revalidatePath("/admin/cms/hotels");
  revalidatePath("/staff/hotels");
}

// ---------------------------------------------------------------------------
// Flights (Admin only)
// ---------------------------------------------------------------------------

export async function saveFlightAction(isNew: boolean, _prevState: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = flightSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
  const { id, ...data } = parsed.data;

  if (isNew) {
    const existing = await db.flight.findUnique({ where: { id } });
    if (existing) return { error: "A flight with this ID already exists." };
    await db.flight.create({ data: { id, ...data } });
  } else {
    await db.flight.update({ where: { id }, data });
  }

  revalidatePath("/admin/cms/flights");
  revalidatePath("/staff/flights");
  redirect("/admin/cms/flights");
}

export async function deleteFlightAction(id: string): Promise<void> {
  await requireAdmin();
  await db.flight.delete({ where: { id } });
  revalidatePath("/admin/cms/flights");
  revalidatePath("/staff/flights");
}

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

export async function addFaqItemAction(formData: FormData): Promise<void> {
  await requireContentEditor();
  const parsed = faqItemSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) return;
  const count = await db.faqItem.count({ where: { categoryId: parsed.data.categoryId } });
  await db.faqItem.create({ data: { ...parsed.data, order: count } });
  revalidatePath("/admin/cms/faq");
  revalidatePath("/staff/cms/faq");
  revalidatePath("/faq");
}

export async function deleteFaqItemAction(id: string): Promise<void> {
  await requireContentEditor();
  await db.faqItem.delete({ where: { id } });
  revalidatePath("/admin/cms/faq");
  revalidatePath("/staff/cms/faq");
  revalidatePath("/faq");
}

export async function addFaqCategoryAction(formData: FormData): Promise<void> {
  await requireContentEditor();
  const category = String(formData.get("category") ?? "").trim();
  if (!category) return;
  const count = await db.faqCategory.count();
  await db.faqCategory.create({ data: { category, order: count } });
  revalidatePath("/admin/cms/faq");
  revalidatePath("/staff/cms/faq");
  revalidatePath("/faq");
}
