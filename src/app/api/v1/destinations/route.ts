import type { NextRequest } from "next/server";
import { getAllDestinations, getDomesticDestinations, getInternationalDestinations } from "@/lib/content/destinations";
import type { Destination } from "@/data/destinations";
import { apiError, apiSuccess } from "@/lib/api/respond";
import { absoluteUrl, absoluteUrls } from "@/lib/api/urls";

function withAbsoluteImages(request: NextRequest, d: Destination): Destination {
  return { ...d, image: absoluteUrl(request, d.image), gallery: absoluteUrls(request, d.gallery) };
}

// GET /api/v1/destinations
// GET /api/v1/destinations?type=domestic | international
export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");

  if (type && type !== "domestic" && type !== "international") {
    return apiError("Query param 'type' must be 'domestic' or 'international'");
  }

  const destinations =
    type === "domestic"
      ? await getDomesticDestinations()
      : type === "international"
        ? await getInternationalDestinations()
        : await getAllDestinations();

  return apiSuccess(destinations.map((d) => withAbsoluteImages(request, d)));
}
