import type { NextRequest } from "next/server";
import {
  getAllPackages,
  getFeaturedPackages,
  getHotDealPackages,
  getPackagesByDestinationSlug,
} from "@/lib/content/packages";
import type { TourPackage } from "@/data/packages";
import { apiSuccess } from "@/lib/api/respond";
import { absoluteUrl } from "@/lib/api/urls";

function withAbsoluteImage(request: NextRequest, p: TourPackage): TourPackage {
  return { ...p, image: absoluteUrl(request, p.image) };
}

// GET /api/v1/packages
// GET /api/v1/packages?destination=goa
// GET /api/v1/packages?featured=true
// GET /api/v1/packages?hotDeal=true
export async function GET(request: NextRequest) {
  const destinationSlug = request.nextUrl.searchParams.get("destination");
  const featured = request.nextUrl.searchParams.get("featured") === "true";
  const hotDeal = request.nextUrl.searchParams.get("hotDeal") === "true";

  const packages = destinationSlug
    ? await getPackagesByDestinationSlug(destinationSlug)
    : featured
      ? await getFeaturedPackages()
      : hotDeal
        ? await getHotDealPackages()
        : await getAllPackages();

  return apiSuccess(packages.map((p) => withAbsoluteImage(request, p)));
}
