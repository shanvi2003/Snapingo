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
// be built. The website's own PDF is untouched and still uses Tailwind.

const BRAND = "#d10e68";
const BRAND_LIGHT = "#fff0f8";
const BRAND_BORDER = "#ffc0e3";
const INK = "#180f17";
const INK_SOFT = "#3a2b37";
const INK_MUTED = "#715769";
const INK_BORDER = "#e5d7e0";

export type CustomItineraryData = {
  tripId: string;
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

function fmtDate(value: Date | null): string {
  return value ? dateFormatter.format(value) : "";
}

// Read once per server instance: these are static files in /public, and
// re-reading ~170KB of PNG on every PDF would be pure waste.
const assetCache = new Map<string, Promise<string>>();

function dataUri(file: string): Promise<string> {
  const cached = assetCache.get(file);
  if (cached) return cached;

  const promise = readFile(path.join(process.cwd(), "public", file))
    .then((buffer) => `data:image/png;base64,${buffer.toString("base64")}`)
    // A missing logo must not take the whole PDF down - the document is still
    // usable without its watermark.
    .catch(() => "");
  assetCache.set(file, promise);
  return promise;
}

function renderBlock(block: ContentBlockView): string {
  const lines = parseContentBody(block.body);
  if (lines.length === 0) return "";

  const paragraphs = lines
    .filter((l) => l.type === "paragraph")
    .map((l) => `<p>${esc(l.text)}</p>`)
    .join("");
  const bullets = lines.filter((l) => l.type === "bullet");
  const list = bullets.length
    ? `<ul>${bullets.map((l) => `<li>${esc(l.text)}</li>`).join("")}</ul>`
    : "";

  return `<section class="block"><h2>${esc(block.title)}</h2>${paragraphs}${list}</section>`;
}

function renderPartyLine(data: CustomItineraryData): string {
  const parts: string[] = [];
  if (data.adults) parts.push(`${data.adults} Adult${data.adults === 1 ? "" : "s"}`);
  if (data.children) parts.push(`${data.children} Child${data.children === 1 ? "" : "ren"}`);
  if (data.infants) parts.push(`${data.infants} Infant${data.infants === 1 ? "" : "s"}`);
  if (data.childAges.length) parts.push(`Ages: ${data.childAges.join(", ")}`);
  return parts.join(" · ");
}

function renderRoomsLine(data: CustomItineraryData): string {
  const parts: string[] = [`${data.rooms} Room${data.rooms === 1 ? "" : "s"}`];
  if (data.extraBeds) parts.push(`${data.extraBeds} Extra Bed${data.extraBeds === 1 ? "" : "s"}`);
  if (data.extraMattresses) {
    parts.push(`${data.extraMattresses} Extra Mattress${data.extraMattresses === 1 ? "" : "es"}`);
  }
  if (data.hotelCategoryLabel) parts.push(data.hotelCategoryLabel);
  if (data.roomCategoryLabel) parts.push(data.roomCategoryLabel);
  return parts.join(" · ");
}

export async function buildCustomItineraryHtml(
  data: CustomItineraryData,
  context: CustomItineraryContext
): Promise<string> {
  const [wordmark, watermark] = await Promise.all([
    dataUri("snapingo-wordmark-horizontal.png"),
    dataUri("snapingo-icon.png"),
  ]);

  const travelWindow =
    data.startDate && data.endDate
      ? `${fmtDate(data.startDate)} – ${fmtDate(data.endDate)}`
      : fmtDate(data.startDate) || "Dates to be confirmed";

  const factRows: [string, string][] = [
    ["Trip ID", data.tripId],
    ["Guest", data.customerName],
    ["Destination", data.destinationName],
    ["Travel dates", travelWindow],
    ["Duration", `${data.durationNights} Nights / ${data.durationDays} Days`],
    ["Travellers", renderPartyLine(data)],
    ["Rooms", renderRoomsLine(data)],
  ];
  if (data.vehicleName) factRows.push(["Vehicle", data.vehicleName]);

  const facts = factRows
    .filter(([, value]) => value)
    .map(
      ([label, value]) =>
        `<div class="fact"><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`
    )
    .join("");

  const stays = data.stays.length
    ? `<section class="block avoid-break">
         <h2>Accommodation</h2>
         <table>
           <thead>
             <tr><th>City</th><th>Hotel</th><th>Category</th><th>Room</th><th>Rooms</th><th>Extras</th></tr>
           </thead>
           <tbody>
             ${data.stays
               .map((stay) => {
                 const extras = [
                   stay.extraBed ? "Extra bed" : "",
                   stay.extraMattress ? "Extra mattress" : "",
                 ]
                   .filter(Boolean)
                   .join(", ");
                 const city = [stay.city, stay.nights ? `${stay.nights}N` : ""]
                   .filter(Boolean)
                   .join(" · ");
                 return `<tr>
                   <td>${esc(city || "—")}</td>
                   <td>${esc(stay.hotelName)}</td>
                   <td>${esc(stay.hotelCategoryLabel ?? "—")}</td>
                   <td>${esc(stay.roomCategoryLabel ?? "—")}</td>
                   <td>${esc(stay.rooms)}</td>
                   <td>${esc(extras || "—")}</td>
                 </tr>`;
               })
               .join("")}
           </tbody>
         </table>
       </section>`
    : "";

  const itinerary = data.days
    .map(
      (day) => `<div class="day avoid-break">
        <div class="day-head">
          <span class="day-num">Day ${esc(day.day)}</span>
          ${day.date ? `<span class="day-date">${esc(fmtDate(day.date))}</span>` : ""}
        </div>
        <p class="day-title">${esc(day.title)}</p>
        ${day.desc ? `<p class="day-desc">${esc(day.desc)}</p>` : ""}
      </div>`
    )
    .join("");

  const twoColumn = `<div class="cols avoid-break">
      <section class="col col-in">
        <h3>Inclusions</h3>
        <ul>${data.inclusions.map((i) => `<li>${esc(i)}</li>`).join("") || "<li>—</li>"}</ul>
      </section>
      <section class="col col-ex">
        <h3>Exclusions</h3>
        <ul>${data.exclusions.map((e) => `<li>${esc(e)}</li>`).join("") || "<li>—</li>"}</ul>
      </section>
    </div>`;

  const pricing = `<section class="block avoid-break">
      <h2>Package Cost</h2>
      <table class="price">
        <tbody>
          <tr><td>Package price</td><td class="num">${esc(formatRupees(data.price))}</td></tr>
          <tr><td>GST (${esc(data.gstPercent)}%)</td><td class="num">${esc(formatRupees(data.gstAmount))}</td></tr>
          <tr class="total"><td>Total payable</td><td class="num">${esc(formatRupees(data.totalAmount))}</td></tr>
        </tbody>
      </table>
    </section>`;

  const contentBlocks = context.blocks.map(renderBlock).join("");

  const head = context.operationHead;
  const contact = head.name
    ? `<section class="block avoid-break contact">
         <h2>Your Trip Coordinator</h2>
         <p class="contact-name">${esc(head.name)}</p>
         <p>Operation Head | ${esc(siteConfig.name)}</p>
         ${head.phone ? `<p>${esc(head.phone)}</p>` : ""}
         ${head.email ? `<p>${esc(head.email)}</p>` : ""}
       </section>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${esc(data.tripId)} — ${esc(data.customerName)}</title>
<style>
  @page { size: A4; margin: 14mm 12mm; }
  * { box-sizing: border-box; }
  /* Both of these are load-bearing, not boilerplate. The renderer is whatever
     Chromium the server happens to run, and if the host is in dark mode
     Chromium will auto-darken a page that never states its own scheme - which
     turned this document into near-black text on a black background. Pinning
     the scheme to light and painting an explicit white background makes the
     output identical no matter what the machine rendering it prefers. */
  html { color-scheme: light; background: #ffffff; }
  body {
    margin: 0;
    background: #ffffff;
    font-family: "Segoe UI", Arial, Helvetica, sans-serif;
    color: ${INK};
    font-size: 11pt;
    line-height: 1.45;
    position: relative;
    /* Keeps the brand colours and tinted panels in the PDF rather than
       letting the print pipeline drop backgrounds to save ink. */
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .watermark {
    position: fixed;
    top: 38%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 260px;
    opacity: 0.06;
    z-index: -1;
  }
  header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    border-bottom: 2.5px solid ${BRAND};
    padding-bottom: 8px;
  }
  header img { height: 46px; }
  .trip-id { font-size: 10pt; color: ${INK_MUTED}; text-align: right; }
  .trip-id strong { display: block; font-size: 13pt; color: ${BRAND}; letter-spacing: 0.5px; }
  h1 { font-size: 20pt; margin: 18px 0 2px; }
  .sub { color: ${INK_MUTED}; margin: 0 0 4px; font-size: 10.5pt; }

  .facts { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
  .fact {
    flex: 1 1 30%;
    min-width: 150px;
    border: 1px solid ${INK_BORDER};
    border-radius: 8px;
    padding: 7px 10px;
  }
  .fact dt { font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.6px; color: ${INK_MUTED}; font-weight: 700; }
  .fact dd { margin: 2px 0 0; font-size: 10.5pt; font-weight: 600; }

  .block { margin-top: 20px; }
  .block h2 {
    display: inline-block;
    font-size: 13pt;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: ${BRAND};
    border-bottom: 2px solid ${BRAND};
    padding-bottom: 3px;
    margin: 0 0 8px;
    break-after: avoid;
  }
  .block p { margin: 6px 0; color: ${INK_SOFT}; }
  .block ul { margin: 6px 0 0; padding-left: 18px; color: ${INK_SOFT}; }
  .block li { margin-bottom: 3px; }

  table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 10pt; }
  th, td { border: 1px solid ${INK_BORDER}; padding: 6px 8px; text-align: left; }
  th { background: ${BRAND_LIGHT}; color: ${BRAND}; font-size: 8.5pt; text-transform: uppercase; letter-spacing: 0.5px; }
  table.price td { border: none; border-bottom: 1px solid ${INK_BORDER}; }
  table.price .num { text-align: right; font-variant-numeric: tabular-nums; }
  table.price tr.total td { font-weight: 800; font-size: 12pt; color: ${BRAND}; border-bottom: none; }

  .day { border-left: 3px solid ${BRAND_BORDER}; padding: 2px 0 8px 12px; margin-top: 12px; }
  .day-head { display: flex; align-items: baseline; gap: 10px; }
  .day-num { font-weight: 800; color: ${BRAND}; font-size: 10.5pt; text-transform: uppercase; letter-spacing: 0.5px; }
  .day-date { font-size: 9.5pt; color: ${INK_MUTED}; }
  .day-title { margin: 2px 0 0; font-weight: 700; font-size: 11.5pt; }
  .day-desc { margin: 3px 0 0; color: ${INK_SOFT}; }

  .cols { display: flex; gap: 12px; margin-top: 20px; }
  .col { flex: 1; border-radius: 8px; padding: 10px 12px; }
  .col h3 { margin: 0 0 4px; font-size: 10.5pt; text-transform: uppercase; letter-spacing: 0.6px; }
  .col ul { margin: 0; padding-left: 16px; font-size: 10pt; }
  .col-in { border: 1px solid #a7e3c4; background: #f0fbf5; }
  .col-in h3 { color: #12734a; }
  .col-ex { border: 1px solid #f5c2c7; background: #fef4f5; }
  .col-ex h3 { color: #ab0a2a; }

  .contact-name { font-size: 13pt; font-weight: 800; margin: 4px 0 0; }
  .contact p { margin: 1px 0; }

  footer {
    margin-top: 24px;
    border-top: 1px solid ${INK_BORDER};
    padding-top: 8px;
    font-size: 8.5pt;
    color: ${INK_MUTED};
  }
  footer .name { font-weight: 700; color: ${INK_SOFT}; font-size: 10pt; }

  /* Chromium honours these when paginating; they keep a hotel table or a
     single itinerary day from being split across two pages. */
  .avoid-break { break-inside: avoid; }
</style>
</head>
<body>
  ${watermark ? `<img class="watermark" src="${watermark}" alt="">` : ""}

  <header>
    ${wordmark ? `<img src="${wordmark}" alt="Snapingo">` : `<span class="name">${esc(siteConfig.name)}</span>`}
    <div class="trip-id">Trip ID<strong>${esc(data.tripId)}</strong></div>
  </header>

  <h1>${esc(data.destinationName)} Itinerary</h1>
  <p class="sub">Prepared for ${esc(data.customerName)}${
    data.customerPhone ? ` · ${esc(data.customerPhone)}` : ""
  }</p>

  <dl class="facts">${facts}</dl>

  ${stays}

  <section class="block">
    <h2>Day-wise Itinerary</h2>
    ${itinerary}
  </section>

  ${twoColumn}

  ${pricing}

  ${contentBlocks}

  ${contact}

  <footer>
    <p class="name">${esc(siteConfig.legalName)}</p>
    <p>${esc(siteConfig.address.street)}, ${esc(siteConfig.address.locality)}, ${esc(
      siteConfig.address.region
    )} ${esc(siteConfig.address.postalCode)}</p>
    <p>${esc(siteConfig.phone)} · ${esc(siteConfig.email)} · ${esc(
      siteConfig.url.replace(/^https?:\/\//, "")
    )}</p>
  </footer>
</body>
</html>`;
}
