import { getPackageItinerary } from "@/lib/content/packages";
import { apiError, apiSuccess } from "@/lib/api/respond";

// GET /api/v1/packages/goa-south-retreat/itinerary
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const itinerary = await getPackageItinerary(id);
  if (!itinerary) return apiError("Package not found", 404);

  return apiSuccess(itinerary);
}
