import type { NextRequest } from "next/server";
import { getServiceBySlug } from "@/lib/content/services";
import { apiError, apiSuccess } from "@/lib/api/respond";
import { absoluteUrl } from "@/lib/api/urls";

// GET /api/v1/services/hotels
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return apiError("Service not found", 404);
  return apiSuccess({ ...service, image: absoluteUrl(request, service.image) });
}
