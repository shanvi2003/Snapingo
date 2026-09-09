import type { NextRequest } from "next/server";
import { getAllBlogPosts } from "@/lib/content/blog";
import { apiSuccess } from "@/lib/api/respond";
import { absoluteUrl } from "@/lib/api/urls";

// GET /api/v1/blog
export async function GET(request: NextRequest) {
  const posts = await getAllBlogPosts();
  return apiSuccess(posts.map((p) => ({ ...p, image: absoluteUrl(request, p.image) })));
}
