import "server-only";
import { cache } from "react";
import { db } from "@/lib/db";
import type { ContentBlockKey } from "@/generated/prisma/enums";
import { readStoredContentBlocks } from "@/lib/validation/contentBlocks";

export type ContentBlockView = {
  key: ContentBlockKey;
  title: string;
  body: string;
};

// Presentation order and default headings for the blocks that make up the
// back half of every itinerary PDF. The heading lives here rather than only
// in the database so a block an admin hasn't saved yet still renders with a
// sensible title instead of an empty <h2>.
export const contentBlockDefinitions: { key: ContentBlockKey; title: string }[] = [
  { key: "PDF_ABOUT", title: "About Snapingo" },
  { key: "PDF_TERMS", title: "Terms & Conditions" },
  { key: "PDF_PAYMENT_POLICY", title: "Payment Policy" },
  { key: "PDF_CANCELLATION_POLICY", title: "Cancellation Policy" },
  { key: "PDF_ACCOUNT_DETAILS", title: "Account Details" },
  { key: "PDF_DISCLAIMER", title: "Disclaimer" },
];

const loadBlocks = cache(async (): Promise<Map<ContentBlockKey, ContentBlockView>> => {
  const rows = await db.contentBlock.findMany();
  return new Map(rows.map((r) => [r.key, { key: r.key, title: r.title, body: r.body }]));
});

/**
 * Every PDF content block in render order, including ones with no row yet
 * (returned with an empty body). Callers skip empty bodies rather than
 * printing a bare heading.
 */
export async function getContentBlocks(): Promise<ContentBlockView[]> {
  const stored = await loadBlocks();
  return contentBlockDefinitions.map(
    (def) => stored.get(def.key) ?? { key: def.key, title: def.title, body: "" }
  );
}

/**
 * The blocks one package or quotation prints: its own saved copy where it has
 * one, the standard content for any block it doesn't. Packages and quotations
 * saved before they could carry their own copy (`contentBlocks` null) get the
 * standard content throughout.
 */
export async function resolveContentBlocks(stored: unknown): Promise<ContentBlockView[]> {
  const own = new Map(readStoredContentBlocks(stored).map((b) => [b.key, b]));
  const standard = await getContentBlocks();
  return standard.map((block) => own.get(block.key) ?? block);
}

export async function getContentBlock(key: ContentBlockKey): Promise<ContentBlockView> {
  const stored = await loadBlocks();
  const fallbackTitle = contentBlockDefinitions.find((d) => d.key === key)?.title ?? "";
  return stored.get(key) ?? { key, title: fallbackTitle, body: "" };
}

export type ContentLine = { type: "bullet" | "paragraph"; text: string };

/**
 * Splits a block body into renderable lines. Deliberately not Markdown: staff
 * are editing this in a plain textarea, and the only structure the PDF needs
 * is "bullet or paragraph". A leading "- " (or "• ") makes a bullet.
 */
export function parseContentBody(body: string): ContentLine[] {
  return body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const bullet = /^[-•]\s+/.exec(line);
      return bullet
        ? { type: "bullet" as const, text: line.slice(bullet[0].length) }
        : { type: "paragraph" as const, text: line };
    });
}
