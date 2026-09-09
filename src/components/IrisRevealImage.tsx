"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const COLS: number = 6;
const ROWS: number = 4;

// Fixed precision keeps the server-rendered and client-hydrated style strings
// byte-identical; without it Framer Motion's SSR vs. hydration formatting of
// long floats can differ and trigger a hydration mismatch.
const round = (n: number) => Math.round(n * 1000) / 1000;

// Same 6x4/24-tile grid as TileRevealImage, but a different reveal shape on
// purpose - this is the About page's hero only, and it's meant to read as
// its own, calmer moment rather than the same effect as every destination/
// package/service page. Instead of each tile flying in from a random
// scattered offset, tiles fade + scale in ring by ring outward from the
// center (delay keyed to distance-from-center, not randomness) - like a
// camera iris opening or a photo developing, which also happens to nod at
// the "Snap" in Snapingo. No position/rotation animation at all, which is
// what makes the two effects feel different rather than like the same
// animation with new numbers.
export default function IrisRevealImage({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);

  const tiles = useMemo(() => {
    const centerCol = (COLS - 1) / 2;
    const centerRow = (ROWS - 1) / 2;
    const maxDist = Math.hypot(centerCol, centerRow);
    const arr = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const dist = Math.hypot(col - centerCol, row - centerRow);
        arr.push({
          key: `${row}-${col}`,
          // Sprite-sheet-style background position: col/(COLS-1) * 100%
          // picks out exactly the col-th horizontal slice (and same for row).
          bgPosX: round(COLS === 1 ? 0 : (col / (COLS - 1)) * 100),
          bgPosY: round(ROWS === 1 ? 0 : (row / (ROWS - 1)) * 100),
          left: round((col / COLS) * 100),
          top: round((row / ROWS) * 100),
          // Ring-by-ring outward from center, capped well under the total
          // animation duration so the outermost tiles don't lag too far
          // behind the center ones.
          delay: round((dist / maxDist) * 0.5),
        });
      }
    }
    return arr;
  }, []);

  const tileWidth = round(100 / COLS);
  const tileHeight = round(100 / ROWS);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Single real <Image>: drives priority/LCP hints for this hero photo.
          Every tile below paints the same underlying URL as a CSS background
          slice, so the browser only ever fetches this one resource instead
          of a separate optimized variant per tile. */}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="100vw"
        loading={priority ? "eager" : undefined}
        fetchPriority={priority ? "high" : undefined}
        className="object-cover opacity-0"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
      />

      {tiles.map((t) => (
        <motion.div
          key={t.key}
          className="absolute overflow-hidden bg-ink-900"
          style={{
            // Each tile is padded 2px past its grid slot on every side (and
            // pulled back to compensate) so neighbouring tiles overlap by a
            // couple of pixels - sub-pixel layout rounding otherwise leaves
            // a hairline gap between tiles that reads as a dark grid line.
            width: `calc(${tileWidth}% + 4px)`,
            height: `calc(${tileHeight}% + 4px)`,
            left: `calc(${t.left}% - 2px)`,
            top: `calc(${t.top}% - 2px)`,
            backgroundImage: `url(${src})`,
            backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
            backgroundPosition: `${t.bgPosX}% ${t.bgPosY}%`,
          }}
          initial={{ opacity: 0, scale: 0.82 }}
          animate={loaded ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.82 }}
          transition={{ duration: 0.7, delay: t.delay, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </div>
  );
}
