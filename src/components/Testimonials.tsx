import Image from "next/image";
import { Quote, Star } from "lucide-react";
import { testimonials } from "@/data/testimonials";
import SectionHeading from "@/components/SectionHeading";

export default function Testimonials() {
  return (
    <section id="testimonials" className="scroll-mt-24 overflow-hidden bg-ink-50/60 pb-8 pt-20 sm:pb-10 sm:pt-28">
      <div className="container-app">
        <SectionHeading
          title="What our travelers say"
          subtitle="Real trips, real feedback, from families, couples & solo explorers."
        />
      </div>

      <div className="mt-14 overflow-hidden mask-fade-x">
        <div className="flex w-max animate-marquee-slow gap-6 hover:[animation-play-state:paused] sm:gap-8">
          {[...testimonials, ...testimonials].map((t, i) => (
            <div
              key={`${t.id}-${i}`}
              className="w-[320px] shrink-0 rounded-3xl border border-ink-100 bg-white p-7 shadow-sm sm:w-[420px] sm:p-9"
            >
              <Quote className="h-9 w-9 text-brand-100" />
              <div className="mt-4 flex gap-0.5">
                {Array.from({ length: 5 }).map((_, si) => (
                  <Star
                    key={si}
                    className={`h-4 w-4 ${
                      si < Math.round(t.rating)
                        ? "fill-gold-500 text-gold-500"
                        : "fill-ink-100 text-ink-100"
                    }`}
                  />
                ))}
              </div>
              <p className="mt-4 text-base leading-relaxed text-ink-700 sm:text-lg">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-7 flex items-center gap-3">
                <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-full ring-2 ring-brand-100">
                  <Image src={t.avatar} alt={t.name} fill quality={85} sizes="48px" className="object-cover" />
                </span>
                <div>
                  <p className="font-heading text-sm font-bold text-ink-900">{t.name}</p>
                  <p className="text-xs text-ink-900">
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
