import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import type { TrustLogoContent } from "@/lib/content/homepage";

function LogoRow({ logos, reverse = false }: { logos: TrustLogoContent[]; reverse?: boolean }) {
  return (
    <div className="overflow-hidden mask-fade-x">
      <div
        className={`flex w-max animate-marquee items-center gap-4 hover:[animation-play-state:paused] sm:gap-5 ${
          reverse ? "[animation-direction:reverse]" : ""
        }`}
      >
        {[...logos, ...logos].map((brand, i) => (
          <div
            key={`${brand.name}-${i}`}
            className="flex h-14 w-32 shrink-0 items-center justify-center rounded-xl border border-ink-100 bg-white px-4 py-2.5 sm:h-16 sm:w-36"
          >
            <div className="relative h-full w-full">
              <Image src={brand.logo} alt={brand.name} fill quality={85} sizes="150px" className="object-contain" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TrustMarquee({ logos }: { logos: TrustLogoContent[] }) {
  const half = Math.ceil(logos.length / 2);
  const topRow = logos.slice(0, half);
  const bottomRow = logos.slice(half).length > 0 ? logos.slice(half) : logos;

  return (
    <section className="border-b border-ink-100 bg-white pb-6 pt-10 sm:py-12">
      <div className="container-app">
        <div className="mb-8 flex items-center justify-center gap-4">
          <span className="h-px w-10 bg-ink-200 sm:w-20" />
          <p className="flex items-center gap-2 whitespace-nowrap text-xs font-bold uppercase tracking-[0.2em] text-ink-900 3xl:text-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-400" />
            Trusted Booking Partners
          </p>
          <span className="h-px w-10 bg-ink-200 sm:w-20" />
        </div>

        {/* Mobile: two contra-rotating rows so the strip reads as a single
            richer block instead of one long scroll on a narrow screen. */}
        <div className="space-y-3 sm:hidden">
          <LogoRow logos={topRow} />
          <LogoRow logos={bottomRow} reverse />
        </div>

        {/* Desktop/tablet: unchanged single row. */}
        <div className="hidden sm:block">
          <LogoRow logos={logos} />
        </div>
      </div>
    </section>
  );
}
