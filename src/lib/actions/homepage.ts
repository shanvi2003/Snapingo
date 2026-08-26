"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireStaffFeature } from "@/lib/dal";
import type { SessionPayload } from "@/lib/session";
import { serviceCategoriesSchema, trustLogosSchema, uspsSchema } from "@/lib/validation/homepage";

export type FormState = { error: string } | undefined;

function basePathFor(session: SessionPayload): string {
  return session.role === "ADMIN" ? "/admin" : "/staff";
}

function parseRows(formData: FormData): unknown {
  try {
    return JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return [];
  }
}

export async function saveServiceCategoriesAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await requireStaffFeature("contentEdit");
  const parsed = serviceCategoriesSchema.safeParse(parseRows(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };

  await db.$transaction([
    db.serviceCategory.deleteMany({}),
    db.serviceCategory.createMany({ data: parsed.data.map((row, i) => ({ ...row, order: i })) }),
  ]);

  revalidatePath("/admin/cms/service-categories");
  revalidatePath("/staff/cms/service-categories");
  revalidatePath("/");
  redirect(`${basePathFor(session)}/cms/service-categories`);
}

export async function saveTrustLogosAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await requireStaffFeature("contentEdit");
  const parsed = trustLogosSchema.safeParse(parseRows(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };

  await db.$transaction([
    db.trustLogo.deleteMany({}),
    db.trustLogo.createMany({ data: parsed.data.map((row, i) => ({ ...row, order: i })) }),
  ]);

  revalidatePath("/admin/cms/trust-logos");
  revalidatePath("/staff/cms/trust-logos");
  revalidatePath("/");
  redirect(`${basePathFor(session)}/cms/trust-logos`);
}

export async function saveUspsAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const session = await requireStaffFeature("contentEdit");
  const parsed = uspsSchema.safeParse(parseRows(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form." };

  await db.$transaction([
    db.usp.deleteMany({}),
    db.usp.createMany({ data: parsed.data.map((row, i) => ({ ...row, order: i })) }),
  ]);

  revalidatePath("/admin/cms/usps");
  revalidatePath("/staff/cms/usps");
  revalidatePath("/");
  redirect(`${basePathFor(session)}/cms/usps`);
}
