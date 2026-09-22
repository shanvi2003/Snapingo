import "server-only";
import { Resend } from "resend";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { siteConfig } from "@/lib/siteConfig";
import type { EmailKind } from "@/generated/prisma/enums";

// Outbound email, so staff can send an itinerary or an invoice to a customer
// without leaving the panel.
//
// Resend is the provider the Vercel Marketplace offers for this category. The
// SDK is wrapped rather than used directly at the call sites so that:
//   - every send is recorded in EmailLog, including failures
//   - a missing API key degrades to a clear "not set up" message instead of
//     throwing somewhere deep in a server action
//   - swapping providers later touches this file only

export type EmailAttachment = { filename: string; content: Buffer };

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  attachments?: EmailAttachment[];
  // What this message is, and what it's about - recorded against the send so
  // staff can answer "did the invoice actually go out?" later.
  kind: EmailKind;
  sentById: string;
  bookingId?: string;
  customPackageId?: string;
  leadId?: string;
};

export type SendEmailResult = { ok: true } | { ok: false; error: string };

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/**
 * Basic shape check before handing an address to the provider. Not a
 * deliverability guarantee - just enough to turn an obvious typo into a
 * message staff can act on rather than a provider-side rejection.
 */
export function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

async function fromHeader(): Promise<{ from: string; replyTo: string | undefined }> {
  const settings = await getSettings();
  const name = settings.email_from_name || siteConfig.name;
  const address = settings.email_from_address;
  const replyTo = settings.email_reply_to || undefined;

  return { from: `${name} <${address}>`, replyTo };
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const { to, subject, html, attachments, kind, sentById, ...links } = input;

  // Recorded whatever happens, so a failed send is visible rather than silent.
  const log = (status: "SENT" | "FAILED", error?: string) =>
    db.emailLog.create({
      data: { to, subject, kind, status, error: error?.slice(0, 500), sentById, ...links },
    });

  if (!isEmailConfigured()) {
    return { ok: false, error: "Email isn't set up yet. Ask an admin to add the email API key." };
  }
  if (!looksLikeEmail(to)) {
    return { ok: false, error: "That doesn't look like a valid email address." };
  }

  const { from, replyTo } = await fromHeader();
  if (!from.includes("@")) {
    return {
      ok: false,
      error: "No sender address is configured. Set it in Admin → Itinerary PDF Content.",
    };
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from,
      to: [to],
      replyTo,
      subject,
      html,
      attachments: attachments?.map((a) => ({ filename: a.filename, content: a.content })),
    });

    if (error) {
      await log("FAILED", error.message);
      return { ok: false, error: error.message };
    }

    await log("SENT");
    return { ok: true };
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Sending failed.";
    await log("FAILED", message);
    return { ok: false, error: message };
  }
}
