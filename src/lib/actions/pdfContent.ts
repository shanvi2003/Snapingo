"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/dal";
import { contentBlockDefinitions } from "@/lib/contentBlocks";
import { settingDefinitions, settingKeys, type SettingKey } from "@/lib/settings";

export type FormState = { error: string } | { success: string } | undefined;

const titleSchema = z.string().trim().min(1, "Every section needs a heading.").max(120);
const bodySchema = z.string().trim().max(8000, "That section is too long (8,000 characters max).");
const settingValueSchema = z.string().trim().max(300);

/**
 * Saves the policy copy and scalar settings that the itinerary PDF renders.
 *
 * Admin-only, deliberately: these blocks appear on every package's PDF and on
 * documents sent to customers, so this is not something a staff account with
 * `packagesEdit` should be able to reword. The package form shows them
 * read-only and only renders its Edit button for admins - this check is what
 * actually enforces that, since a Server Action can be POSTed directly.
 */
export async function savePdfContentAction(
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  await requireSession(["ADMIN"]);

  const blocks: { key: (typeof contentBlockDefinitions)[number]["key"]; title: string; body: string }[] = [];

  for (const def of contentBlockDefinitions) {
    const title = titleSchema.safeParse(formData.get(`title.${def.key}`) ?? "");
    const body = bodySchema.safeParse(formData.get(`body.${def.key}`) ?? "");
    if (!title.success) return { error: title.error.issues[0]?.message ?? "Check the headings." };
    if (!body.success) return { error: body.error.issues[0]?.message ?? "Check the content." };
    blocks.push({ key: def.key, title: title.data, body: body.data });
  }

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

  // One transaction: a half-saved policy set would mean customers receiving
  // PDFs that mix old and new wording.
  await db.$transaction([
    ...blocks.map((block) =>
      db.contentBlock.upsert({
        where: { key: block.key },
        update: { title: block.title, body: block.body },
        create: block,
      })
    ),
    ...settings.map((setting) =>
      db.setting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: setting,
      })
    ),
  ]);

  revalidatePath("/admin/cms/pdf-content");
  // Every package's public page renders the itinerary PDF, so the copy change
  // has to reach all of them, not just the admin screen.
  revalidatePath("/packages", "layout");

  return { success: "Saved. All itinerary PDFs now use this content." };
}
