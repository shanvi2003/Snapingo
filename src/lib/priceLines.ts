// A quotation's per-person price breakup: one line per kind of traveller
// ("Adult", "Child with bed"...), each with how many and the rate per person
// before GST. Staff enter the rates; the package price is their sum, so the
// breakup printed on the PDF and the total can never disagree. The PDF shows
// the rates with GST included and no separate GST line.

export type PriceLine = { label: string; count: number; rate: number };

export const MAX_PRICE_LINES = 10;

const toInt = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
};

/**
 * Cleans rows from the form or the database. A row needs a name and at least
 * one person - a "Child" row left at 0 children is the form's starting row,
 * not part of the quote. A rate of 0 is kept: an infant can travel free.
 */
export function parsePriceLines(value: unknown): PriceLine[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((row) => {
      const r = (row ?? {}) as Record<string, unknown>;
      return {
        label: String(r.label ?? "").trim().slice(0, 80),
        count: Math.min(toInt(r.count), 99),
        rate: toInt(r.rate),
      };
    })
    .filter((line) => line.label && line.count > 0)
    .slice(0, MAX_PRICE_LINES);
}

export const priceLineAmount = (line: PriceLine) => line.count * line.rate;

export const priceLinesTotal = (lines: PriceLine[]) =>
  lines.reduce((sum, line) => sum + priceLineAmount(line), 0);

/** A per-person rate with GST added, in whole rupees. */
export const rateWithGst = (rate: number, gstPercent: number) => Math.round((rate * (100 + gstPercent)) / 100);

export const priceLineAmountWithGst = (line: PriceLine, gstPercent: number) =>
  line.count * rateWithGst(line.rate, gstPercent);

/**
 * Price, GST and total for a breakup. The itinerary prints each rate with GST
 * already added, so GST is rounded per person rather than once on the whole
 * price: that way "rate × travellers" on every printed row adds up exactly
 * to the printed total. The form preview, the save and the PDF all use this.
 */
export function priceLinesGst(lines: PriceLine[], gstPercent: number) {
  const price = priceLinesTotal(lines);
  const totalAmount = lines.reduce((sum, line) => sum + priceLineAmountWithGst(line, gstPercent), 0);
  return { price, percent: gstPercent, gstAmount: totalAmount - price, totalAmount };
}
