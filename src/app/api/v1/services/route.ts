import type { NextRequest } from "next/server";
import { getAllServices } from "@/lib/content/services";
import { apiSuccess } from "@/lib/api/respond";
import { absoluteUrl } from "@/lib/api/urls";

// GET /api/v1/services
export async function GET(request: NextRequest) {
  const services = await getAllServices();
  return apiSuccess(services.map((s) => ({ ...s, image: absoluteUrl(request, s.image) })));
}
