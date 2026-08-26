import Image from "next/image";
import { Quote, Star } from "lucide-react";
import { getAllTestimonials } from "@/lib/content/testimonials";
import SectionHeading from "@/components/SectionHeading";

export default async function Testimonials() {
  const testimonials = await getAllTestimonials();

  return (
    <section id="testimonials" className="scroll-mt-24 overflow-hidden bg-ink-50/60 pb-8 pt-20 sm:pb-10 sm:pt-28">
      <div className="container-app">
        <SectionHeading
          title="What our travelers say"
          subtitle="Real trips, real feedback, from families, couples & solo explorers."
        />
      </div>

      <div className="mt-10 overflow-hidden mask-fade-x sm:mt-14">
        <div className="flex w-max animate-marquee-slow gap-4 hover:[animation-play-state:paused] sm:gap-8">
          {[...testimonials, ...testimonials].map((t, i) => (
            <div
              key={`${t.id}-${i}`}
              className="w-[240px] shrink-0 rounded-2xl border border-ink-100 bg-white p-4 shadow-sm sm:w-[420px] sm:rounded-3xl sm:p-9 3xl:w-[480px] 3xl:p-10"
            >
              <Quote className="h-6 w-6 text-brand-100 sm:h-9 sm:w-9" />
              <div className="mt-2 flex gap-0.5 sm:mt-4">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    className={`h-3 w-3 sm:h-4 sm:w-4 ${
                      si < Math.round(t.rating)
                        ? "fill-gold-500 text-gold-500"
                        : "fill-ink-100 text-ink-100"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-700 sm:mt-4 sm:text-lg 3xl:text-xl">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-3 flex items-center gap-2.5 sm:mt-7 sm:gap-3">
                <span className="relative block h-9 w-9 shrink-0 overflow-hidden rounded-full ring-2 ring-brand-100 sm:h-12 sm:w-12 3xl:h-14 3xl:w-14">
                  <Image src={t.avatar} alt={t.name} fill quality={85} sizes="48px" className="object-cover" />
                </span>
                <div>
                  <p className="font-heading text-xs font-bold text-ink-900 sm:text-sm 3xl:text-base">{t.name}</p>
                  <p className="text-[11px] text-ink-900 sm:text-xs 3xl:text-sm">
                    {t.location} · Trip to {t.trip}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
