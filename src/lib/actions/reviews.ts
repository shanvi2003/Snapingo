"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireStaffFeature } from "@/lib/dal";
import type { SessionPayload } from "@/lib/session";
import { testimonialSchema } from "@/lib/validation/testimonial";

export type FormState = { error: string } | undefined;

function basePathFor(session: SessionPayload): string {
  return session.role === "ADMIN" ? "/admin" : "/staff";
}

function parseForm(formData: FormData) {
  return testimonialSchema.safeParse(Object.fromEntries(formData.entries()));
}

export async function createTestimonialAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await requireStaffFeature("reviewsEdit");
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await db.testimonial.create({ data: { id: `t_${Date.now().toString(36)}`, ...parsed.data } });
  revalidatePath("/admin/reviews");
  revalidatePath("/staff/reviews");
  redirect(`${basePathFor(session)}/reviews`);
}

export async function updateTestimonialAction(id: string, _prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await requireStaffFeature("reviewsEdit");
  const parsed = parseForm(formData);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await db.testimonial.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/reviews");
  revalidatePath("/staff/reviews");
  redirect(`${basePathFor(session)}/reviews`);
}

export async function deleteTestimonialAction(id: string): Promise<void> {
  await requireStaffFeature("reviewsEdit");
  await db.testimonial.delete({ where: { id } });
  revalidatePath("/admin/reviews");
  revalidatePath("/staff/reviews");
}
