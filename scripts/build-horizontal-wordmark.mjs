// Derives public/snapingo-wordmark-horizontal.png: the icon and the
// "Snapingo" wordmark glyph side-by-side on one line (matching the
// itinerary PDF reference's header lockup), built from the same source art
// as extract-wordmark.mjs (public/snapingo-logo.png - solid magenta bg,
// white glyph, icon stacked above the wordmark).
//
// Run with: node scripts/build-horizontal-wordmark.mjs
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const input = path.join(root, "public", "snapingo-logo.png");
const iconInput = path.join(root, "public", "snapingo-icon.png");
const output = path.join(root, "public", "snapingo-wordmark-horizontal.png");

const brand = [0xd1, 0x0e, 0x68]; // --color-brand-600

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const alpha = new Uint8Array(width * height);

for (let i = 0; i < width * height; i++) {
  const r = data[i * channels];
  const g = data[i * channels + 1];
  const b = data[i * channels + 2];
  const minc = Math.min(r, g, b);
  alpha[i] = Math.max(0, Math.min(255, Math.round(((minc - 60) * 255) / (255 - 60))));
}

const out = Buffer.alloc(width * height * 4);
for (let i = 0; i < width * height; i++) {
  out[i * 4] = brand[0];
  out[i * 4 + 1] = brand[1];
  out[i * 4 + 2] = brand[2];
  out[i * 4 + 3] = alpha[i];
}

// The source canvas has large transparent margins around the icon+wordmark
// art (it's a square export) - trim those first so the row-scan below
// operates on actual content, not empty space.
const {
  data: trimmedData,
  info: trimmedInfo,
} = await sharp(out, { raw: { width, height, channels: 4 } })
  .trim({ threshold: 10 })
  .raw()
  .toBuffer({ resolveWithObject: true });
const tw = trimmedInfo.width;
const th = trimmedInfo.height;

// Row alpha-sum profile to find the valley between the icon hump (top) and
// the wordmark hump (bottom) so we can split them.
const rowSum = new Array(th).fill(0);
for (let y = 0; y < th; y++) {
  let s = 0;
  for (let x = 0; x < tw; x++) s += trimmedData[(y * tw + x) * 4 + 3];
  rowSum[y] = s;
}
// The icon's tail flourish tapers down and visually bridges into the
// wordmark with no fully-empty row between them, so instead of hunting for
// a alpha valley, find where the row-sum jumps sharply - that's where the
// bulk of the actual letterforms starts. Everything above belongs to the
// icon (which is rendered separately from public/snapingo-icon.png anyway,
// tail included), so a stray sliver of tail ending up in the icon crop is
// harmless - it just needs to be fully out of the text crop.
let splitY = Math.floor(th * 0.5);
let bestJump = -Infinity;
for (let y = Math.floor(th * 0.4); y < Math.floor(th * 0.9); y++) {
  const jump = rowSum[y + 3] - rowSum[y];
  if (jump > bestJump) {
    bestJump = jump;
    splitY = y;
  }
}

console.log({ tw, th, splitY, bestJump });

// Crop generously above the jump point (to keep the full rounded top of the
// "S" and the "i" dot, which sits noticeably above the other letters' caps)
// then keep only the connected alpha blobs above a size floor - this drops
// any stray sliver of the icon's tail flourish that bleeds into the crop
// without having to find a pixel-perfect cut line.
const cropTop = Math.max(0, splitY - 160);
const cropH = th - cropTop;
const region = Buffer.alloc(tw * cropH * 4);
for (let y = 0; y < cropH; y++) {
  trimmedData.copy(region, y * tw * 4, (cropTop + y) * tw * 4, (cropTop + y + 1) * tw * 4);
}

const mask = new Uint8Array(tw * cropH);
for (let i = 0; i < tw * cropH; i++) mask[i] = region[i * 4 + 3] > 10 ? 1 : 0;

// Letters are separate blobs (S, n, a, p, i, n, g, o aren't touching), so
// keep every "letter-sized" component and only drop tiny ones (the stray
// tail sliver, a few stray pixels) relative to the biggest letter.
const labels = new Int32Array(tw * cropH).fill(-1);
const sizes = [];
let label = 0;
const stack = new Int32Array(tw * cropH);
for (let start = 0; start < tw * cropH; start++) {
  if (mask[start] !== 1 || labels[start] !== -1) continue;
  let sp = 0;
  stack[sp++] = start;
  labels[start] = label;
  let size = 0;
  while (sp > 0) {
    const p = stack[--sp];
    size++;
    const x = p % tw;
    const y = (p / tw) | 0;
    const neighbors = [
      x > 0 ? p - 1 : -1,
      x < tw - 1 ? p + 1 : -1,
      y > 0 ? p - tw : -1,
      y < cropH - 1 ? p + tw : -1,
    ];
    for (const n of neighbors) {
      if (n >= 0 && mask[n] === 1 && labels[n] === -1) {
        labels[n] = label;
        stack[sp++] = n;
      }
    }
  }
  sizes.push(size);
  label++;
}

// Track each component's bounding box too - the stray tail sliver and the
// "i" dot can be similar in pixel area, so position (does it sit above a
// real letter, or off in the gap before the first letter?) is what tells
// them apart, not size alone.
const bbox = sizes.map(() => ({ minX: tw, maxX: -1, minY: cropH, maxY: -1 }));
for (let i = 0; i < tw * cropH; i++) {
  const l = labels[i];
  if (l === -1) continue;
  const x = i % tw;
  const y = (i / tw) | 0;
  const b = bbox[l];
  if (x < b.minX) b.minX = x;
  if (x > b.maxX) b.maxX = x;
  if (y < b.minY) b.minY = y;
  if (y > b.maxY) b.maxY = y;
}
// Size alone can't separate the stray tail sliver from a real small mark
// like the "i" dot (the sliver can be just as many pixels as the dot). The
// sliver is part of a shape that continues off the top of this crop, so it
// always touches row 0; every real letter part (including the dot, which
// has headroom above it) does not. Drop anything that touches the top edge.
const keep = sizes.map((s, i) => s > 30 && bbox[i].minY > 0);
for (let i = 0; i < tw * cropH; i++) {
  const l = labels[i];
  if (l === -1 || !keep[l]) region[i * 4 + 3] = 0;
}

const textBuf = await sharp(region, { raw: { width: tw, height: cropH, channels: 4 } })
  .png()
  .trim({ threshold: 10 })
  .toBuffer();

const textMeta = await sharp(textBuf).metadata();
const iconMeta = await sharp(iconInput).metadata();

// Target text height sets the scale; icon height derived from the source
// icon's own aspect ratio so it isn't stretched, then visually matched to
// the reference lockup's proportions (icon roughly as tall as the wordmark
// including descenders).
const textHeight = 340;
const textWidth = Math.round((textMeta.width / textMeta.height) * textHeight);
const iconHeight = Math.round(textHeight * 1.28);
const iconWidth = Math.round((iconMeta.width / iconMeta.height) * iconHeight);
const gap = Math.round(textHeight * 0.22);

const canvasWidth = iconWidth + gap + textWidth;
const canvasHeight = Math.max(iconHeight, textHeight);

const iconResized = await sharp(iconInput).resize(iconWidth, iconHeight).png().toBuffer();
const textResized = await sharp(textBuf).resize(textWidth, textHeight).png().toBuffer();

await sharp({
  create: {
    width: canvasWidth,
    height: canvasHeight,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([
    { input: iconResized, left: 0, top: Math.round((canvasHeight - iconHeight) / 2) },
    { input: textResized, left: iconWidth + gap, top: Math.round((canvasHeight - textHeight) / 2) },
  ])
  .png()
  .toFile(output);

console.log(`Wrote ${output} (${canvasWidth}x${canvasHeight})`);
