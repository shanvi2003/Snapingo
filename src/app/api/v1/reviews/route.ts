import type { NextRequest } from "next/server";
import { getAllTestimonials } from "@/lib/content/testimonials";
import { apiSuccess } from "@/lib/api/respond";
import { absoluteUrl } from "@/lib/api/urls";

// GET /api/v1/reviews
export async function GET(request: NextRequest) {
  const reviews = await getAllTestimonials();
  return apiSuccess(reviews.map((r) => ({ ...r, avatar: absoluteUrl(request, r.avatar) })));
}
