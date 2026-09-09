import type { NextRequest } from "next/server";
import { getDestinationBySlug } from "@/lib/content/destinations";
import { apiError, apiSuccess } from "@/lib/api/respond";
import { absoluteUrl, absoluteUrls } from "@/lib/api/urls";

// GET /api/v1/destinations/goa
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const destination = await getDestinationBySlug(slug);
  if (!destination) return apiError("Destination not found", 404);

  return apiSuccess({
    ...destination,
    image: absoluteUrl(request, destination.image),
    gallery: absoluteUrls(request, destination.gallery),
  });
}
