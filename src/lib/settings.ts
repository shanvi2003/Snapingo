import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";

// The full set of scalar settings the app reads, each with the fallback used
// when the row is missing (a fresh database, or a key added in a later
// release before anyone has saved a value). Adding a setting means adding it
// here and nowhere else - the admin form, the typed reader and the defaults
// are all driven off this one object.
export const settingDefinitions = {
  gst_percent: {
    label: "GST percentage",
    help: "Applied automatically to package price when creating a booking.",
    fallback: "5",
  },
  trip_id_prefix: {
    label: "Trip ID prefix",
    help: 'Leading text on generated Trip IDs, e.g. "SNP" produces SNP-2026-0042.',
    fallback: "SNP",
  },
  operation_head_name: {
    label: "Operation head name",
    help: "Printed as the contact person on every generated itinerary PDF.",
    fallback: "",
  },
  operation_head_phone: { label: "Operation head phone", help: "", fallback: "" },
  operation_head_email: { label: "Operation head email", help: "", fallback: "" },
  email_from_name: {
    label: "Email sender name",
    help: "Shown as the sender on emails sent to customers.",
    fallback: "Snapingo",
  },
  email_from_address: {
    label: "Email sender address",
    help: "Must be an address on a domain verified with the email provider, or sending will fail.",
    fallback: "",
  },
  email_reply_to: {
    label: "Email reply-to address",
    help: "Where customer replies go. Leave blank to use the sender address.",
    fallback: "",
  },
} as const;

export type SettingKey = keyof typeof settingDefinitions;

export const settingKeys = Object.keys(settingDefinitions) as SettingKey[];

const loadSettings = cache(async (): Promise<Record<SettingKey, string>> => {
  const rows = await db.setting.findMany();
  const stored = new Map(rows.map((r) => [r.key, r.value]));

  return Object.fromEntries(
    settingKeys.map((key) => [key, stored.get(key) ?? settingDefinitions[key].fallback])
  ) as Record<SettingKey, string>;
});

export async function getSettings(): Promise<Record<SettingKey, string>> {
  return loadSettings();
}

export async function getSetting(key: SettingKey): Promise<string> {
  return (await loadSettings())[key];
}

/**
 * GST as a number. Guards against a non-numeric or out-of-range value saved
 * by hand: an invalid rate silently becoming NaN would propagate into every
 * invoice total, so it falls back to the default instead.
 */
export async function getGstPercent(): Promise<number> {
  const raw = await getSetting("gst_percent");
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    return Number(settingDefinitions.gst_percent.fallback);
  }
  return parsed;
}
