import type { NextRequest } from "next/server";
import { getServiceCategories, getTrustLogos, getUsps } from "@/lib/content/homepage";
import { getFeaturedPackages, getHotDealPackages } from "@/lib/content/packages";
import { apiSuccess } from "@/lib/api/respond";
import { absoluteUrl } from "@/lib/api/urls";

// GET /api/v1/home
// One bundled call for a home screen - the same sections shown on the
// website's homepage, fetched together instead of five separate round trips.
export async function GET(request: NextRequest) {
  const [serviceCategories, trustLogos, usps, featuredPackages, hotDealPackages] = await Promise.all([
    getServiceCategories(),
    getTrustLogos(),
    getUsps(),
    getFeaturedPackages(),
    getHotDealPackages(),
  ]);

  return apiSuccess({
    serviceCategories: serviceCategories.map((c) => ({ ...c, image: absoluteUrl(request, c.image) })),
    trustLogos: trustLogos.map((l) => ({ ...l, logo: absoluteUrl(request, l.logo) })),
    usps,
    featuredPackages: featuredPackages.map((p) => ({ ...p, image: absoluteUrl(request, p.image) })),
    hotDealPackages: hotDealPackages.map((p) => ({ ...p, image: absoluteUrl(request, p.image) })),
  });
}
