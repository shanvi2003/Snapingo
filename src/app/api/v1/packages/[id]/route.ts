import type { NextRequest } from "next/server";
import { getPackageById, getSimilarPackages } from "@/lib/content/packages";
import { apiError, apiSuccess } from "@/lib/api/respond";
import { absoluteUrl } from "@/lib/api/urls";

// GET /api/v1/packages/goa-south-retreat
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pkg = await getPackageById(id);
  if (!pkg) return apiError("Package not found", 404);

  const similar = await getSimilarPackages({
    currentId: pkg.id,
    destinationSlug: pkg.destinationSlug,
    type: pkg.type,
  });

  return apiSuccess({
    ...pkg,
    image: absoluteUrl(request, pkg.image),
    similarPackages: similar.map((s) => ({ ...s, image: absoluteUrl(request, s.image) })),
  });
}
