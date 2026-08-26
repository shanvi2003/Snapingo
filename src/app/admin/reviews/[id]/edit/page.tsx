import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import TestimonialForm from "@/components/admin/reviews/TestimonialForm";
import { updateTestimonialAction } from "@/lib/actions/reviews";

export default async function EditReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const testimonial = await db.testimonial.findUnique({ where: { id } });
  if (!testimonial) notFound();

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ink-900">Edit Review</h1>
      <TestimonialForm action={updateTestimonialAction.bind(null, id)} defaults={testimonial} submitLabel="Save Changes" />
    </div>
  );
}
