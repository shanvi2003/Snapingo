import { NextResponse } from "next/server";
import { requireStaffFeature } from "@/lib/dal";
import { loadCustomItinerary } from "@/lib/pdf/customItineraryData";
import { buildCustomItineraryHtml } from "@/lib/pdf/customItineraryHtml";
import { renderPdfFromHtml } from "@/lib/pdf/renderPdf";

// Launching Chromium and paginating a document takes longer than a normal
// request; the platform default would cut a large itinerary off mid-render.
export const maxDuration = 60;
// Quotations are per-customer documents - nothing here may be cached or
// prerendered, and every request re-checks the session.
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireStaffFeature("customPackages");

  const { id } = await params;
  const loaded = await loadCustomItinerary(id);
  if (!loaded) return NextResponse.json({ error: "Quotation not found" }, { status: 404 });

  const html = await buildCustomItineraryHtml(loaded.data, loaded.context);
  const pdf = await renderPdfFromHtml(html);

  // Filename is the Trip ID so a staff member sending three quotations over
  // WhatsApp can tell them apart in their downloads folder.
  const filename = `${loaded.data.tripId}-${loaded.data.customerName.replace(/[^a-zA-Z0-9]+/g, "-")}.pdf`;

  return new NextResponse(pdf as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
