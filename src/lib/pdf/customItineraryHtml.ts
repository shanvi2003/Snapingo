import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ContentBlockView } from "@/lib/contentBlocks";
import { parseContentBody } from "@/lib/contentBlocks";
import { formatRupees } from "@/lib/gst";
import { siteConfig } from "@/lib/siteConfig";

// Why this template is plain CSS rather than the Tailwind-based
// ItineraryPrintView the website uses: this HTML is handed straight to a
// headless browser via setContent, with no server to fetch a stylesheet from
// and no Next.js build output in scope. Inlining everything makes the render
// deterministic - the PDF looks the same from a cron job, a server action or
// a local dev machine - instead of depending on which CSS chunk happened to
// be built.
//
// The look is the website package PDF's (ItineraryPrintView, e.g. the Bali
// quotation): same Lexend font, sizes, colours, boxes and page watermarks.
// Pixel values below are that component's Tailwind classes written out -
// text-[21px] -> 21px, text-sm -> 14px, mt-4 -> 16px and so on - so the two
// documents read as one family. Change one, check the other.

const BRAND = "#d10e68"; // brand-600
const BRAND_700 = "#ab0a55";
const BRAND_50 = "#fff0f8";
const BRAND_200 = "#ffc0e3";
const BRAND_300 = "#fd8fc9";
const INK_900 = "#180f17";
const INK_800 = "#261a24";
const INK_700 = "#3a2b37";
const INK_600 = "#513e4c";
const INK_500 = "#715769";
const INK_400 = "#9c7d94";
const INK_200 = "#e5d7e0";
const INK_100 = "#f4ecf1";
const EMERALD_50 = "#ecfdf5";
const EMERALD_200 = "#a7f3d0";
const EMERALD_800 = "#065f46";
const ROSE_50 = "#fff1f2";
const ROSE_200 = "#fecdd3";
const ROSE_700 = "#be123c";

export type CustomItineraryData = {
  tripId: string;
  tripType?: string | null;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  destinationName: string;
  startDate: Date | null;
  endDate: Date | null;
  durationNights: number;
  durationDays: number;
  adults: number;
  children: number;
  infants: number;
  childAges: string[];
  rooms: number;
  extraBeds: number;
  extraMattresses: number;
  roomCategoryLabel: string | null;
  hotelCategoryLabel: string | null;
  vehicleName: string | null;
  price: number;
  gstPercent: number;
  gstAmount: number;
  totalAmount: number;
  inclusions: string[];
  exclusions: string[];
  days: { day: number; date: Date | null; title: string; desc: string }[];
  stays: {
    city: string | null;
    nights: number | null;
    days: number | null;
    hotelName: string;
    hotelCategoryLabel: string | null;
    roomCategoryLabel: string | null;
    rooms: number;
    extraBed: boolean;
    extraMattress: boolean;
  }[];
};

export type CustomItineraryContext = {
  blocks: ContentBlockView[];
  operationHead: { name: string; phone: string; email: string };
};

// Escapes everything staff typed. This HTML is assembled by string
// concatenation and then rendered by a real browser, so an unescaped
// apostrophe or angle bracket in a hotel name would corrupt the document -
// and a pasted <script> would execute inside the render.
function esc(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

// "6 October 2026", as the website PDF prints its quotation date.
const longDateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function fmtDate(value: Date | null): string {
  return value ? dateFormatter.format(value) : "";
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

const MIME: Record<string, string> = { ".png": "image/png", ".ttf": "font/ttf" };

// Read once per server instance: these are static files in /public, and
// re-reading them on every PDF would be pure waste.
const assetCache = new Map<string, Promise<string>>();

function dataUri(file: string): Promise<string> {
  const cached = assetCache.get(file);
  if (cached) return cached;

  const mime = MIME[path.extname(file)] ?? "application/octet-stream";
  const promise = readFile(path.join(process.cwd(), "public", file))
    .then((buffer) => `data:${mime};base64,${buffer.toString("base64")}`)
    // A missing asset must not take the whole PDF down - the document is
    // still usable without its watermark, or in a fallback font.
    .catch(() => "");
  assetCache.set(file, promise);
  return promise;
}

// One admin-edited block (About, Terms, Payment Policy...): paragraphs first,
// then "• " bullets, as ItineraryPrintView's ContentSection lays them out. An
// empty body prints nothing, not an orphan heading.
function renderBlock(block: ContentBlockView): string {
  const lines = parseContentBody(block.body);
  if (lines.length === 0) return "";

  const paragraphs = lines
    .filter((l) => l.type === "paragraph")
    .map((l) => `<p class="content-p">${esc(l.text)}</p>`)
    .join("");
  const bullets = lines.filter((l) => l.type === "bullet");
  const list = bullets.length
    ? `<ul class="content-ul">${bullets.map((l) => `<li>&bull; ${esc(l.text)}</li>`).join("")}</ul>`
    : "";

  // Terms & Conditions runs to several pages; at the body size the other
  // sections use, it dwarfed the actual trip. Smaller here only.
  const sizeClass = block.key === "PDF_TERMS" ? " content-small" : "";
  return `<section class="content${sizeClass}"><h2 class="section-heading">${esc(block.title)}</h2>${paragraphs}${list}</section>`;
}

function renderPartyLine(data: CustomItineraryData): string {
  const parts: string[] = [];
  if (data.adults) parts.push(plural(data.adults, "Adult", "Adults"));
  if (data.children) parts.push(plural(data.children, "Child", "Children"));
  if (data.infants) parts.push(plural(data.infants, "Infant", "Infants"));
  return parts.join(" · ");
}

function renderRoomsLine(data: CustomItineraryData): string {
  const parts: string[] = [plural(data.rooms, "Room", "Rooms")];
  if (data.extraBeds) parts.push(plural(data.extraBeds, "Extra Bed", "Extra Beds"));
  if (data.extraMattresses) parts.push(plural(data.extraMattresses, "Extra Mattress", "Extra Mattresses"));
  return parts.join(" · ");
}

// Lucide's "user" glyph, inline: the website PDF's operation-head badge uses
// the same icon from lucide-react, which isn't available to a string template.
const USER_ICON = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

export async function buildCustomItineraryHtml(
  data: CustomItineraryData,
  context: CustomItineraryContext
): Promise<string> {
  const [wordmark, iconMark, mountains, lexend] = await Promise.all([
    dataUri("snapingo-wordmark-horizontal.png"),
    dataUri("snapingo-icon.png"),
    dataUri("snapingo-mountain-hills.png"),
    dataUri("fonts/Lexend-Variable.ttf"),
  ]);

  const quoteDate = longDateFormatter.format(new Date());
  const travelWindow =
    data.startDate && data.endDate
      ? `${fmtDate(data.startDate)} – ${fmtDate(data.endDate)}`
      : fmtDate(data.startDate) || "Dates to be confirmed";
  const duration = `${plural(data.durationNights, "Night", "Nights")} / ${plural(data.durationDays, "Day", "Days")}`;
  const tripTypeLabel =
    data.tripType === "international" ? "International Trip" : data.tripType === "domestic" ? "Domestic Trip" : "";
  const party = renderPartyLine(data);
  const categoryLine = [data.hotelCategoryLabel, data.roomCategoryLabel].filter(Boolean).join(" · ");

  // ---- Trip details: who and when, in the same box style as Accommodation.
  const detailRows: [string, string][] = [
    ["Guest", [data.customerName, data.customerPhone].filter(Boolean).join(" · ")],
    ["Travel Dates", travelWindow],
    ["Travellers", party],
    ["Infant Ages", data.childAges.filter(Boolean).join(", ")],
    ["Rooms", renderRoomsLine(data)],
  ];
  const details = `<section class="box mt-4 avoid-break">
      <h2 class="box-heading">Trip Details</h2>
      <table class="details">
        <tbody>
          ${detailRows
            .filter(([, value]) => value)
            .map(([label, value]) => `<tr><th>${esc(label)}</th><td>${esc(value)}</td></tr>`)
            .join("")}
        </tbody>
      </table>
    </section>`;

  // ---- Accommodation: the website PDF's per-city table, or its single-box
  // fallback when no hotels were entered.
  const stays = data.stays.length
    ? `<section class="mt-4 avoid-break">
         <h2 class="box-heading">Accommodation</h2>
         <table class="stays">
           <thead><tr><th>Destination</th><th>Hotel</th><th>Category</th></tr></thead>
           <tbody>
             ${data.stays
               .map((stay) => {
                 const length = [
                   stay.nights ? plural(stay.nights, "Night", "Nights") : "",
                   stay.days ? plural(stay.days, "Day", "Days") : "",
                 ]
                   .filter(Boolean)
                   .join(" / ");
                 const where = [stay.city, length].filter(Boolean).join(" — ");
                 const category = [stay.hotelCategoryLabel, stay.roomCategoryLabel].filter(Boolean).join(" · ");
                 return `<tr>
                   <td>${esc(where || "—")}</td>
                   <td>${esc(stay.hotelName)}</td>
                   <td>${esc(category || "—")}</td>
                 </tr>`;
               })
               .join("")}
           </tbody>
         </table>
         <p class="note-strong">&bull; Hotels listed above, or similar category properties, confirmed at the time of booking.</p>
       </section>`
    : `<section class="box mt-4 avoid-break">
         <h2 class="box-heading">Accommodation</h2>
         <p class="note-strong mt-2">&bull; Handpicked ${esc(
           categoryLine ? categoryLine.toLowerCase() : "quality"
         )} category hotels/resorts along the route, confirmed at the time of booking.</p>
       </section>`;

  const vehicle = data.vehicleName
    ? `<section class="box mt-4 avoid-break">
         <h2 class="box-heading">Vehicle / Transport</h2>
         <p class="vehicle-name">${esc(data.vehicleName)}</p>
         <p class="vehicle-note">Used for all airport/station pickups, drops, transfers and sightseeing listed in the itinerary below.</p>
       </section>`
    : "";

  const itinerary = data.days
    .map(
      (day) => `<div class="day avoid-break">
        <span class="day-pill">Day ${esc(day.day)}${day.title ? ` : ${esc(day.title)}` : ""}</span>
        ${day.date ? `<span class="day-date">${esc(fmtDate(day.date))}</span>` : ""}
        ${day.desc ? `<p class="day-desc">${esc(day.desc)}</p>` : ""}
      </div>`
    )
    .join("");

  const inclusionsExclusions = `<div class="cols mt-6 avoid-break">
      <section class="col col-in">
        <h2>Inclusion</h2>
        <ul>${data.inclusions.map((i) => `<li>&bull; ${esc(i)}</li>`).join("") || "<li>&bull; —</li>"}</ul>
      </section>
      <section class="col col-ex">
        <h2>Exclusions</h2>
        <ul>${data.exclusions.map((e) => `<li>&bull; ${esc(e)}</li>`).join("") || "<li>&bull; —</li>"}</ul>
      </section>
    </div>`;

  // The disclaimer closes the footer, as on the website PDF; every other
  // block prints as its own section, in the order the admin panel keeps them.
  const disclaimer = context.blocks.find((b) => b.key === "PDF_DISCLAIMER");
  const contentBlocks = context.blocks
    .filter((b) => b.key !== "PDF_DISCLAIMER")
    .map(renderBlock)
    .join("");

  const head = context.operationHead;
  const operationHead = head.name
    ? `<div class="op-head avoid-break">
         <div class="op-card">
           <span class="op-icon">${USER_ICON}</span>
           <div>
             <p class="op-role">Operation Head</p>
             <p class="op-name">${esc(head.name)}</p>
           </div>
         </div>
         <ul class="op-list">
           <li>&bull; Operation Head | ${esc(siteConfig.name)}</li>
           ${head.phone ? `<li>&bull; ${esc(head.phone)}</li>` : ""}
           ${head.email ? `<li>&bull; ${esc(head.email)}</li>` : ""}
           <li>&bull; ${esc(siteConfig.url.replace(/^https?:\/\//, ""))}</li>
         </ul>
       </div>`
    : "";

  const disclaimerLines = disclaimer
    ? parseContentBody(disclaimer.body)
        .map((line) => `<p class="mt-2">${esc(line.text)}</p>`)
        .join("")
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(data.tripId)} — ${esc(data.customerName)}</title>
<style>
  ${lexend ? `@font-face { font-family: "Lexend"; src: url("${lexend}") format("truetype"); font-weight: 100 900; font-style: normal; }` : ""}
  /* The website PDF's page box (globals.css @media print). The watermark
     offsets below are measured against this margin - keep them together. */
  @page { size: A4; margin: 1.5cm; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  /* Both of these are load-bearing, not boilerplate. The renderer is whatever
     Chromium the server happens to run, and if the host is in dark mode
     Chromium will auto-darken a page that never states its own scheme - which
     turned this document into near-black text on a black background. Pinning
     the scheme to light and painting the page white makes the output identical
     no matter what the machine rendering it prefers.
     The white goes on <html> only: a background on <body> is painted above the
     watermarks (z-index -1) and hid them on every page but the last. */
  html { color-scheme: light; background: #ffffff; }
  body {
    font-family: "Lexend", "Segoe UI", Arial, sans-serif;
    color: ${INK_900};
    font-size: 16px;
    line-height: 1.5;
    /* Keeps the brand colours and tinted panels in the PDF rather than
       letting the print pipeline drop backgrounds to save ink. */
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  ul { list-style: none; }

  /* Chromium repeats position:fixed elements on every printed page, which is
     what puts both marks on each page of the document. */
  .wm-icon {
    position: fixed; inset: 0; z-index: -1;
    display: flex; align-items: center; justify-content: center;
  }
  .wm-icon img { width: 320px; height: 320px; object-fit: contain; opacity: 0.07; }
  .wm-mountains {
    position: fixed; bottom: -100px; right: -184px; z-index: -1;
    width: 596px; height: 398px; overflow: hidden;
  }
  .wm-mountains img { width: 100%; height: 100%; object-fit: contain; object-position: bottom; opacity: 0.07; }

  .mt-2 { margin-top: 8px; }
  .mt-4 { margin-top: 16px; }
  .mt-6 { margin-top: 24px; }
  .avoid-break { break-inside: avoid; }

  header {
    display: flex; align-items: center; justify-content: space-between;
    border-bottom: 2px solid ${BRAND}; padding-bottom: 8px;
  }
  header img { height: 48px; width: auto; }
  header .unit { font-size: 14px; line-height: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.025em; color: ${INK_700}; }
  .meta {
    margin-top: 12px; display: flex; justify-content: space-between;
    border-bottom: 1px solid ${INK_100}; padding-bottom: 8px;
    font-size: 12px; line-height: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.025em; color: ${INK_500};
  }

  .title { margin-top: 12px; }
  .badge {
    display: inline-block; border-radius: 6px; background: ${BRAND}; padding: 4px 12px;
    font-size: 14px; line-height: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.025em; color: #fff;
  }
  h1 { margin-top: 6px; font-size: 20px; line-height: 1.25; font-weight: 800; color: ${INK_900}; }
  .subtitle { margin-top: 2px; font-size: 14px; line-height: 20px; color: ${INK_600}; }
  .bar {
    margin-top: 8px; display: flex; align-items: center; justify-content: space-between; gap: 12px;
    border-radius: 6px; background: ${BRAND}; padding: 8px 16px;
  }
  .bar span { white-space: nowrap; font-size: 11px; font-weight: 700; color: #fff; }

  .price {
    margin-top: 12px; display: flex; align-items: center; justify-content: space-between;
    border: 1px solid ${BRAND_200}; border-radius: 12px; background: ${BRAND_50}; padding: 12px 20px;
  }
  .price-label { font-size: 14px; line-height: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.025em; color: ${BRAND_700}; }
  .price-amount { margin-top: 4px; font-size: 28px; font-weight: 800; color: ${BRAND}; }
  .price-pill { border-radius: 9999px; background: ${BRAND}; padding: 8px 16px; font-size: 14px; line-height: 20px; font-weight: 700; color: #fff; }

  .box { border: 1px solid ${BRAND_200}; border-radius: 12px; padding: 12px; }
  .box-heading { font-size: 21px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.025em; color: ${INK_900}; }

  table { width: 100%; border-collapse: collapse; }
  table.details { margin-top: 8px; font-size: 16px; line-height: 24px; }
  table.details th { width: 150px; padding: 2px 12px 2px 0; text-align: left; vertical-align: top; font-weight: 800; color: ${INK_900}; }
  table.details td { padding: 2px 0; font-weight: 600; color: ${INK_800}; }

  table.stays { margin-top: 8px; border: 1px solid ${BRAND_200}; font-size: 16px; line-height: 24px; }
  table.stays th, table.stays td { border: 1px solid ${BRAND_200}; padding: 8px 12px; text-align: left; }
  table.stays th { font-size: 22px; font-weight: 800; color: ${BRAND}; }
  table.stays td { font-weight: 600; color: ${INK_900}; }
  table.stays tr { break-inside: avoid; }
  .note-strong { margin-top: 6px; font-size: 16px; line-height: 24px; font-weight: 700; color: ${BRAND}; }

  .vehicle-name { margin-top: 6px; font-size: 21px; font-weight: 800; color: ${BRAND}; }
  .vehicle-note { margin-top: 4px; font-size: 15px; color: ${BRAND}; }

  .itinerary { margin-top: 32px; }
  .itinerary-heading {
    margin: 0 auto; width: fit-content; border: 1px solid ${BRAND_300}; border-radius: 12px; padding: 12px 32px;
    break-inside: avoid; break-after: avoid;
  }
  .itinerary-heading h2 { font-size: 36px; line-height: 40px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.025em; color: ${BRAND}; }
  .days { margin-top: 20px; }
  .day + .day { margin-top: 16px; }
  .day-pill { display: inline-block; border-radius: 6px; background: ${BRAND}; padding: 6px 12px; font-size: 21px; font-weight: 700; color: #fff; }
  .day-date { margin-left: 10px; font-size: 15px; font-weight: 600; color: ${INK_500}; }
  .day-desc { margin-top: 6px; font-size: 19px; line-height: 1.625; color: ${INK_800}; white-space: pre-line; }

  /* Flexbox, not grid: Chromium's print pagination can leave a ghost
     fragment of a grid column's border on the previous page. */
  .cols { display: flex; gap: 16px; }
  .col { flex: 1; border-radius: 12px; padding: 16px; }
  .col h2 { font-size: 21px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.025em; }
  .col ul { margin-top: 8px; font-size: 19px; color: ${INK_800}; }
  .col li + li { margin-top: 4px; }
  .col li { break-inside: avoid; }
  .col-in { border: 1px solid ${EMERALD_200}; background: ${EMERALD_50}; }
  .col-in h2 { color: ${EMERALD_800}; }
  .col-ex { border: 1px solid ${ROSE_200}; background: ${ROSE_50}; }
  .col-ex h2 { color: ${ROSE_700}; }

  .content { margin-top: 24px; }
  .section-heading {
    display: inline-block; border-bottom: 2px solid ${BRAND}; padding-bottom: 4px;
    font-size: 28px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.025em; color: ${BRAND};
    break-after: avoid;
  }
  .content-p { margin-top: 8px; font-size: 19px; line-height: 1.625; color: ${INK_800}; }
  .content-ul { margin-top: 8px; font-size: 19px; color: ${INK_800}; }
  .content-ul li { break-inside: avoid; }
  .content-ul li + li { margin-top: 4px; }
  .content-small .content-p, .content-small .content-ul { font-size: 15px; }
  .content-small .content-ul li + li { margin-top: 3px; }

  .help { margin-top: 24px; border: 1px solid ${BRAND_200}; border-radius: 12px; background: ${BRAND_50}; padding: 16px; }
  .help h2 { font-size: 17px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.025em; color: ${BRAND_700}; }
  .help p { font-size: 14px; line-height: 20px; color: ${INK_800}; }
  .help .lead { margin-top: 8px; line-height: 1.625; }
  .help .call { margin-top: 8px; font-weight: 700; color: ${INK_900}; }
  .help .mail { margin-top: 4px; }

  .op-head { margin-top: 24px; display: flex; flex-wrap: wrap; align-items: center; gap: 24px; }
  .op-card { display: flex; min-width: 300px; align-items: center; gap: 12px; border: 1px solid ${BRAND_200}; border-radius: 12px; padding: 16px 20px; }
  .op-icon { display: grid; place-items: center; width: 40px; height: 40px; flex-shrink: 0; border-radius: 9999px; background: ${BRAND}; color: #fff; }
  .op-role { font-size: 24px; line-height: 32px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.025em; color: ${BRAND}; }
  .op-name { font-size: 27px; font-weight: 800; color: ${INK_900}; }
  .op-list { font-size: 17px; color: ${INK_800}; }
  .op-list li + li { margin-top: 4px; }

  footer { margin-top: 32px; border-top: 1px solid ${INK_200}; padding-top: 12px; font-size: 17px; color: ${INK_500}; break-inside: avoid; }
  footer .company { font-size: 20px; line-height: 28px; font-weight: 600; color: ${INK_700}; }
  footer .line { margin-top: 4px; }
  .muted { color: ${INK_400}; }
</style>
</head>
<body>
  ${iconMark ? `<div class="wm-icon" aria-hidden="true"><img src="${iconMark}" alt=""></div>` : ""}
  ${mountains ? `<div class="wm-mountains" aria-hidden="true"><img src="${mountains}" alt=""></div>` : ""}

  <header>
    ${wordmark ? `<img src="${wordmark}" alt="Snapingo">` : `<span class="unit">${esc(siteConfig.name)}</span>`}
    <p class="unit">A unit of SNAP Tour and Travels Pvt. Ltd.</p>
  </header>

  <div class="meta">
    <span>Quotation Generated: ${esc(quoteDate)}</span>
    <span>Trip ID: ${esc(data.tripId)}</span>
  </div>

  <div class="title avoid-break">
    <span class="badge">Customized Package</span>
    <h1>${esc(data.destinationName)} Itinerary</h1>
    <p class="subtitle">Prepared for ${esc(data.customerName)}</p>
    <div class="bar">
      <span>${esc(duration)}</span>
      ${tripTypeLabel ? `<span>${esc(tripTypeLabel)}</span>` : ""}
      <span>${esc(travelWindow)}</span>
    </div>
  </div>

  <div class="price avoid-break">
    <div>
      <p class="price-label">Total Price</p>
      <p class="price-amount">${esc(formatRupees(data.totalAmount))}</p>
    </div>
    ${party ? `<p class="price-pill">${esc(party)}</p>` : ""}
  </div>

  ${details}

  ${stays}

  ${vehicle}

  <section class="itinerary">
    <div class="itinerary-heading"><h2>Day-by-Day Itinerary</h2></div>
    <div class="days">${itinerary}</div>
  </section>

  ${inclusionsExclusions}

  ${contentBlocks}

  <section class="help avoid-break">
    <h2>Need Help?</h2>
    <p class="lead">Talk to a travel expert to confirm dates, customize this itinerary or complete your booking.</p>
    <p class="call">WhatsApp / Call: ${esc(siteConfig.phone)}</p>
    <p class="mail">Email: ${esc(siteConfig.email)}</p>
  </section>

  ${operationHead}

  <footer>
    <p class="company">SNAPINGO TRAVELS</p>
    <p class="line">${esc(siteConfig.address.street)}, ${esc(siteConfig.address.locality)}, ${esc(
      siteConfig.address.region
    )} ${esc(siteConfig.address.postalCode)}</p>
    <p class="line">${esc(siteConfig.phone)} &middot; ${esc(siteConfig.email)} &middot; ${esc(
      siteConfig.url.replace(/^https?:\/\//, "")
    )}</p>
    ${disclaimerLines}
  </footer>
</body>
</html>`;
}
