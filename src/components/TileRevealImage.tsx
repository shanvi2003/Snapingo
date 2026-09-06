"use client";

import { useState } from "react";
import Image from "next/image";

// Was a 6x4 grid of 24 individually-animated Framer Motion tiles (each
// tweening x/y/rotate/scale/opacity on its own timer). Fired on every
// destination, package, and service detail page load - 24 concurrent
// animations is real, measurable main-thread work on top of everything else
// a fresh page load is already doing (hydration, image decode), and on a
// mid/low-end phone that's exactly the kind of burst that reads as a
// stutter. This keeps the same "image reveals once loaded" feel with a
// single element and a plain CSS transition instead.
export default function TileRevealImage({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 transition-[opacity,transform] duration-700 ease-out"
        style={{ opacity: loaded ? 1 : 0, transform: loaded ? "scale(1)" : "scale(1.06)" }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes="100vw"
          loading={priority ? "eager" : undefined}
          fetchPriority={priority ? "high" : undefined}
          className="object-cover"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
        />
      </div>
    </div>
  );
}
