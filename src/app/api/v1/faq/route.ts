import { getAllFaqs } from "@/lib/content/faq";
import { apiSuccess } from "@/lib/api/respond";

// GET /api/v1/faq
export async function GET() {
  const faqs = await getAllFaqs();
  return apiSuccess(faqs);
}
