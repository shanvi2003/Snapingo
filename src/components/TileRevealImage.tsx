"use client";

import { useMemo } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const COLS: number = 6;
const ROWS: number = 4;

function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Fixed precision keeps the server-rendered and client-hydrated style strings
// byte-identical; without it Framer Motion's SSR vs. hydration formatting of
// long floats can differ and trigger a hydration mismatch.
const round = (n: number) => Math.round(n * 1000) / 1000;

export default function TileRevealImage({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const reduceMotion = useReducedMotion();

  const tiles = useMemo(() => {
    const arr = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const i = row * COLS + col;
        const r1 = seededRandom(i * 12.9898 + 1);
        const r2 = seededRandom(i * 78.233 + 7);
        const r3 = seededRandom(i * 39.425 + 3);
        arr.push({
          key: `${row}-${col}`,
          // Sprite-sheet-style background position: col/(COLS-1) * 100%
          // picks out exactly the col-th horizontal slice (and same for row).
          bgPosX: round(COLS === 1 ? 0 : (col / (COLS - 1)) * 100),
          bgPosY: round(ROWS === 1 ? 0 : (row / (ROWS - 1)) * 100),
          left: round((col / COLS) * 100),
          top: round((row / ROWS) * 100),
          offsetX: round((r1 - 0.5) * 520),
          offsetY: round((r2 - 0.5) * 420),
          rotate: round((r3 - 0.5) * 140),
          delay: round((r1 * 0.5 + r2 * 0.5) * 0.5),
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
          initial={reduceMotion ? { opacity: 1 } : { x: t.offsetX, y: t.offsetY, rotate: t.rotate, opacity: 0, scale: 0.4 }}
          animate={{ x: 0, y: 0, rotate: 0, opacity: 1, scale: 1 }}
          transition={
            reduceMotion
              ? { duration: 0.3 }
              : { duration: 1, delay: t.delay, ease: [0.16, 1, 0.3, 1] }
          }
        />
      ))}
    </div>
  );
}
