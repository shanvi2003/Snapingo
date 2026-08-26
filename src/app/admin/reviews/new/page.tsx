import TestimonialForm from "@/components/admin/reviews/TestimonialForm";
import { createTestimonialAction } from "@/lib/actions/reviews";

export default function NewReviewPage() {
  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">New Review</h1>
      <TestimonialForm action={createTestimonialAction} submitLabel="Create Review" />
    </div>
  );
}
