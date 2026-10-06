"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/dal";
import { settingDefinitions, settingKeys, type SettingKey } from "@/lib/settings";

export type FormState = { error: string } | { success: string } | undefined;

const settingValueSchema = z.string().trim().max(300);

/**
 * Saves the company-wide settings (GST rate, operation-head contact, Trip ID
 * prefix, email sender).
 *
 * Admin-only, deliberately: these reach every customer-facing document, and a
 * Server Action can be POSTed directly, so this check is what enforces it.
 *
 * The PDF's text sections are no longer saved here: each package and
 * quotation keeps its own copy, edited on its own form. The ContentBlock rows
 * this used to write remain as the standard copy new ones start from.
 */
export async function savePdfContentAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireSession(["ADMIN"]);

  const settings: { key: SettingKey; value: string }[] = [];
  for (const key of settingKeys) {
    const raw = formData.get(`setting.${key}`);
    // A key missing from the submission is left alone rather than blanked, so
    // a future form that only renders some of the settings can't wipe the rest.
    if (raw === null) continue;
    const parsed = settingValueSchema.safeParse(raw);
    if (!parsed.success) return { error: `${settingDefinitions[key].label} is too long.` };
    settings.push({ key, value: parsed.data });
  }

  const gst = settings.find((s) => s.key === "gst_percent");
  if (gst) {
    const value = Number(gst.value);
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      return { error: "GST percentage must be a number between 0 and 100." };
    }
  }

  // One transaction, so the settings never end up half-saved.
  await db.$transaction(
    settings.map((setting) =>
      db.setting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: setting,
      })
    )
  );

  revalidatePath("/admin/settings");
  // The operation-head contact prints on every package's PDF.
  revalidatePath("/packages", "layout");

  return { success: "Settings saved." };
}
