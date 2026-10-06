import { z } from "zod";

// The PDF content blocks (About, Terms, Payment Policy...) a package or
// quotation carries as its own copy. Kept free of server-only imports so the
// form schemas on both sides can share it.

export const CONTENT_BLOCK_KEYS = [
  "PDF_ABOUT",
  "PDF_TERMS",
  "PDF_PAYMENT_POLICY",
  "PDF_CANCELLATION_POLICY",
  "PDF_ACCOUNT_DETAILS",
  "PDF_DISCLAIMER",
] as const;

export type ContentBlockKeyValue = (typeof CONTENT_BLOCK_KEYS)[number];
export type ContentBlockInput = { key: ContentBlockKeyValue; title: string; body: string };

const blockSchema = z.object({
  key: z.enum(CONTENT_BLOCK_KEYS),
  title: z.string().trim().min(1, "Every PDF section needs a heading.").max(120),
  body: z.string().trim().max(8000, "A PDF section is too long (8,000 characters max)."),
});

/**
 * The form posts every block as one JSON string. Absent means "nothing
 * posted" (leave the stored copy alone), not "clear it".
 */
export const contentBlocksField = z
  .string()
  .optional()
  .transform((value, ctx): ContentBlockInput[] | undefined => {
    if (!value) return undefined;
    let raw: unknown;
    try {
      raw = JSON.parse(value);
    } catch {
      ctx.addIssue({ code: "custom", message: "Invalid PDF content." });
      return z.NEVER;
    }
    const parsed = z.array(blockSchema).max(CONTENT_BLOCK_KEYS.length).safeParse(raw);
    if (!parsed.success) {
      ctx.addIssue({ code: "custom", message: parsed.error.issues[0]?.message ?? "Invalid PDF content." });
      return z.NEVER;
    }
    return parsed.data;
  });

/** Reads a stored `contentBlocks` JSON column, ignoring anything malformed. */
export function readStoredContentBlocks(stored: unknown): ContentBlockInput[] {
  const parsed = z.array(blockSchema).safeParse(stored);
  return parsed.success ? parsed.data : [];
}
