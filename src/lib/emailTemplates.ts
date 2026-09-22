import "server-only";
import { siteConfig } from "@/lib/siteConfig";
import { formatRupees } from "@/lib/gst";

// Plain, self-contained HTML with inline styles - email clients strip <style>
// blocks, ignore most modern CSS, and Outlook in particular renders through
// Word's engine. A table-free, inline-styled layout is what actually survives
// that, so this deliberately does not reuse the site's Tailwind components.

function esc(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const BRAND = "#d10e68";
const INK = "#180f17";
const INK_SOFT = "#3a2b37";
const INK_MUTED = "#715769";

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#faf6f9;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;font-family:Arial,Helvetica,sans-serif;color:${INK};">
    <div style="background:#ffffff;border-radius:12px;padding:28px 24px;">
      <p style="margin:0 0 4px;font-size:20px;font-weight:bold;color:${BRAND};">${esc(siteConfig.name)}</p>
      <p style="margin:0 0 20px;font-size:12px;color:${INK_MUTED};">${esc(siteConfig.legalName)}</p>

      <h1 style="margin:0 0 16px;font-size:19px;color:${INK};">${esc(title)}</h1>
      ${bodyHtml}

      <hr style="border:none;border-top:1px solid #e5d7e0;margin:24px 0 14px;">
      <p style="margin:0;font-size:12px;color:${INK_MUTED};">
        ${esc(siteConfig.address.street)}, ${esc(siteConfig.address.locality)},
        ${esc(siteConfig.address.region)} ${esc(siteConfig.address.postalCode)}<br>
        ${esc(siteConfig.phone)} &middot; ${esc(siteConfig.email)}
      </p>
    </div>
  </div>
</body>
</html>`;
}

function paragraphs(lines: string[]): string {
  return lines
    .map((line) => `<p style="margin:0 0 12px;font-size:14px;line-height:1.55;color:${INK_SOFT};">${line}</p>`)
    .join("");
}

function detailRows(rows: [string, string][]): string {
  return `<div style="background:#faf6f9;border-radius:8px;padding:14px 16px;margin:0 0 16px;">
    ${rows
      .filter(([, value]) => value)
      .map(
        ([label, value]) =>
          `<p style="margin:0 0 6px;font-size:13px;color:${INK_SOFT};">
             <span style="color:${INK_MUTED};">${esc(label)}:</span>
             <strong style="color:${INK};">${esc(value)}</strong>
           </p>`
      )
      .join("")}
  </div>`;
}

export function itineraryEmail(input: {
  customerName: string;
  tripId: string;
  destinationName: string;
  travelWindow: string;
  totalAmount: number;
  senderName: string;
  note?: string;
}): { subject: string; html: string } {
  const subject = `Your ${input.destinationName} itinerary (${input.tripId})`;

  const html = layout(
    `Here's your ${input.destinationName} itinerary`,
    [
      paragraphs([`Hi ${esc(input.customerName)},`]),
      paragraphs([
        `Thank you for talking to us. Your itinerary is attached as a PDF — it covers the day-by-day plan, where you'll be staying, what's included and the full cost.`,
      ]),
      detailRows([
        ["Trip ID", input.tripId],
        ["Destination", input.destinationName],
        ["Travel dates", input.travelWindow],
        ["Total", formatRupees(input.totalAmount)],
      ]),
      input.note ? paragraphs([esc(input.note).replace(/\n/g, "<br>")]) : "",
      paragraphs([
        `Anything you'd like changed — dates, hotels, inclusions — just reply to this email and we'll rework it.`,
        `Warm regards,<br><strong>${esc(input.senderName)}</strong>`,
      ]),
    ].join("")
  );

  return { subject, html };
}

export function invoiceEmail(input: {
  customerName: string;
  reference: string;
  destinationName: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  senderName: string;
  note?: string;
}): { subject: string; html: string } {
  const subject = `Invoice ${input.reference} — ${input.destinationName}`;

  const html = layout(
    `Your invoice`,
    [
      paragraphs([`Hi ${esc(input.customerName)},`]),
      paragraphs([`Please find your invoice attached.`]),
      detailRows([
        ["Reference", input.reference],
        ["Trip", input.destinationName],
        ["Total", formatRupees(input.totalAmount)],
        ["Paid", formatRupees(input.paidAmount)],
        ["Balance due", formatRupees(Math.max(0, input.dueAmount))],
      ]),
      input.note ? paragraphs([esc(input.note).replace(/\n/g, "<br>")]) : "",
      paragraphs([
        `If anything looks wrong, reply to this email and we'll sort it out.`,
        `Warm regards,<br><strong>${esc(input.senderName)}</strong>`,
      ]),
    ].join("")
  );

  return { subject, html };
}
