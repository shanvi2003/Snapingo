import Image from "next/image";
import Link from "next/link";
import { Pencil, Plus, Star } from "lucide-react";
import { db } from "@/lib/db";
import DeleteTestimonialButton from "@/components/admin/reviews/DeleteTestimonialButton";

export default async function ReviewsListPage({ basePath = "/admin" }: { basePath?: string }) {
  const testimonials = await db.testimonial.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ink-900">Reviews</h1>
          <p className="mt-1 text-sm text-ink-500">Customer testimonials shown on the homepage.</p>
        </div>
        <Link
          href={`${basePath}/reviews/new`}
          className="flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          New Review
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {testimonials.map((t) => (
          <div key={t.id} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="relative block h-11 w-11 overflow-hidden rounded-full bg-ink-100">
                  <Image src={t.avatar} alt={t.name} fill sizes="44px" className="object-cover" unoptimized />
                </span>
                <div>
                  <p className="font-semibold text-ink-900">{t.name}</p>
                  <p className="text-xs text-ink-500">{t.location}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Link
                  href={`${basePath}/reviews/${t.id}/edit`}
                  className="grid h-8 w-8 place-items-center rounded-full text-ink-400 transition hover:bg-brand-50 hover:text-brand-600"
                  aria-label="Edit review"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <DeleteTestimonialButton id={t.id} />
              </div>
            </div>
            <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-gold-600">
              <Star className="h-3.5 w-3.5 fill-gold-500 text-gold-500" />
              {t.rating} · {t.trip}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ink-700">&ldquo;{t.quote}&rdquo;</p>
          </div>
        ))}
        {testimonials.length === 0 && (
          <p className="col-span-full rounded-2xl border border-ink-100 bg-white p-10 text-center text-sm text-ink-500 shadow-sm">
            No reviews yet.
          </p>
        )}
      </div>
    </div>
  );
}
