import type { NextRequest } from "next/server";
import { getBlogPostById } from "@/lib/content/blog";
import { apiError, apiSuccess } from "@/lib/api/respond";
import { absoluteUrl } from "@/lib/api/urls";

// GET /api/v1/blog/b1
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await getBlogPostById(id);
  if (!post) return apiError("Blog post not found", 404);
  return apiSuccess({ ...post, image: absoluteUrl(request, post.image) });
}
