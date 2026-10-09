import { describe, it, expect } from "vitest";
import {
  buildCustomItineraryHtml,
  type CustomItineraryContext,
  type CustomItineraryData,
} from "./customItineraryHtml";

function makeData(overrides: Partial<CustomItineraryData> = {}): CustomItineraryData {
  return {
    tripId: "SNP-2026-0042",
    customerName: "Asha Menon",
    customerPhone: "+91 90000 00000",
    customerEmail: "asha@example.com",
    destinationName: "Manali",
    startDate: new Date("2026-03-04T00:00:00Z"),
    endDate: new Date("2026-03-09T00:00:00Z"),
    durationNights: 5,
    durationDays: 6,
    adults: 2,
    children: 1,
    infants: 0,
    childAges: ["7"],
    rooms: 1,
    extraBeds: 1,
    extraMattresses: 0,
    roomCategoryLabel: "Deluxe",
    hotelCategoryLabel: "4 Star",
    vehicleName: "Innova Crysta",
    price: 60000,
    gstPercent: 5,
    gstAmount: 3000,
    totalAmount: 63000,
    inclusions: ["Accommodation", "Meals"],
    exclusions: ["Flight", "Visa"],
    days: [{ day: 1, date: new Date("2026-03-04T00:00:00Z"), title: "Arrival", desc: "Check in." }],
    stays: [
      {
        city: "Manali",
        nights: 5,
        days: 6,
        hotelName: "Snow Valley Resort",
        hotelCategoryLabel: "4 Star",
        roomCategoryLabel: "Deluxe",
        rooms: 1,
        extraBed: true,
        extraMattress: false,
      },
    ],
    ...overrides,
  };
}

const context: CustomItineraryContext = {
  blocks: [
    { key: "PDF_TERMS", title: "Terms & Conditions", body: "- Advance Amount is Non-Refundable." },
    { key: "PDF_ABOUT", title: "About Snapingo", body: "" },
  ],
  operationHead: { name: "Ashutosh Pandey", phone: "+91 87077 36609", email: "ops@example.com" },
  preparedBy: null,
};

describe("buildCustomItineraryHtml", () => {
  it("renders the trip's own identifying details", async () => {
    const html = await buildCustomItineraryHtml(makeData(), context);
    expect(html).toContain("SNP-2026-0042");
    expect(html).toContain("Asha Menon");
    expect(html).toContain("Snow Valley Resort");
    expect(html).toContain("Manali · 5 Nights / 6 Days");
    expect(html).toContain("Innova Crysta");
  });

  // The customer only ever sees the GST-inclusive total, never the split.
  it("prints only the total, without the GST breakdown", async () => {
    const html = await buildCustomItineraryHtml(makeData(), context);
    expect(html).toContain("₹63,000");
    expect(html).not.toContain("₹60,000");
    expect(html).not.toContain("₹3,000");
    // Inlined images/fonts are base64, which can spell "GST" by chance.
    expect(html.replace(/data:[^")]+/g, "")).not.toMatch(/GST/);
  });

  // The quotation is a customer-facing document assembled by string
  // concatenation: an unescaped angle bracket in a hotel name would break the
  // markup, and a pasted <script> would run inside the rendering browser.
  it("escapes everything staff typed", async () => {
    const html = await buildCustomItineraryHtml(
      makeData({
        customerName: '<script>alert("x")</script>',
        stays: [
          {
            city: "A & B",
            nights: 1,
            days: null,
            hotelName: 'The "Grand" <Hotel>',
            hotelCategoryLabel: null,
            roomCategoryLabel: null,
            rooms: 1,
            extraBed: false,
            extraMattress: false,
          },
        ],
      }),
      context
    );

    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("The &quot;Grand&quot; &lt;Hotel&gt;");
    expect(html).toContain("A &amp; B");
  });

  it("renders a content block's bullets and skips one with an empty body", async () => {
    const html = await buildCustomItineraryHtml(makeData(), context);
    expect(html).toContain("Advance Amount is Non-Refundable.");
    // The About block has no body, so its heading must not appear either.
    expect(html).not.toContain("About Snapingo");
  });

  it("omits the coordinator card when no operation head is configured", async () => {
    const html = await buildCustomItineraryHtml(makeData(), {
      ...context,
      operationHead: { name: "", phone: "", email: "" },
    });
    expect(html).not.toContain("Operation Head</p>");
  });

  // No hotels entered: like the website PDF, a "handpicked hotels" line
  // stands in for the table rather than an empty one.
  it("prints who prepared it under the operation head, or nothing when unnamed", async () => {
    const html = await buildCustomItineraryHtml(makeData(), {
      ...context,
      preparedBy: { name: "Riya Kapoor", role: "Travel Executive" },
    });
    expect(html).toContain("Prepared By");
    expect(html).toContain("Riya Kapoor");
    expect(html).toContain("Travel Executive");
    expect(html.indexOf("Prepared By")).toBeGreaterThan(html.indexOf("Ashutosh Pandey"));

    expect(await buildCustomItineraryHtml(makeData(), context)).not.toContain("Prepared By");
  });

  it("still produces a document when there are no stays or inclusions", async () => {
    const html = await buildCustomItineraryHtml(
      makeData({ stays: [], inclusions: [], exclusions: [] }),
      context
    );
    expect(html).toContain("<!doctype html>");
    expect(html).not.toContain('<table class="stays">');
    expect(html).toContain("Handpicked");
  });

  it("inlines the logo, watermarks and font so the renderer needs no network", async () => {
    const html = await buildCustomItineraryHtml(makeData(), context);
    expect(html).toContain("data:image/png;base64,");
    expect(html).toContain('class="wm-icon"');
    expect(html).toContain('class="wm-mountains"');
    expect(html).toContain("data:font/ttf;base64,");
  });
});
