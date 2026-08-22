import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { trustLogos } from "@/data/site";

export default function TrustMarquee() {
  return (
    <section className="border-b border-ink-100 bg-white py-10 sm:py-12">
      <div className="container-app">
        <div className="mb-8 flex items-center justify-center gap-4">
          <span className="h-px w-10 bg-ink-200 sm:w-20" />
          <p className="flex items-center gap-2 whitespace-nowrap text-xs font-bold uppercase tracking-[0.2em] text-ink-900">
            <ShieldCheck className="h-3.5 w-3.5 text-brand-400" />
            Trusted Booking Partners
          </p>
          <span className="h-px w-10 bg-ink-200 sm:w-20" />
        </div>

        <div className="overflow-hidden mask-fade-x">
          <div className="flex w-max animate-marquee items-center gap-4 sm:gap-5">
            {[...trustLogos, ...trustLogos].map((brand, i) => (
              <div
                key={`${brand.name}-${i}`}
                className="flex h-14 w-32 shrink-0 items-center justify-center rounded-xl border border-ink-100 bg-white px-4 py-2.5 sm:h-16 sm:w-36"
              >
                <div className="relative h-full w-full">
                  <Image
                    src={brand.logo}
                    alt={brand.name}
                    fill
                    quality={85}
                    sizes="150px"
                    className="object-contain"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
