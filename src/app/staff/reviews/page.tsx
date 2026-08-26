import { requireStaffFeature } from "@/lib/dal";
import ReviewsListPage from "@/components/admin/reviews/ReviewsListPage";

export default async function StaffReviewsPage() {
  await requireStaffFeature("reviewsEdit");
  return <ReviewsListPage basePath="/staff" />;
}
