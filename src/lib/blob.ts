import "server-only";
import { del, get, put } from "@vercel/blob";

// File storage for staff uploads: package/destination cover images, and the
// booking vouchers that get attached to a trip.
//
// ---------------------------------------------------------------------------
// On "private" storage
// ---------------------------------------------------------------------------
// The brief asked for the blob store to be private, so uploads can't be
// listed or reached by guessing a link. That is exactly right for documents,
// and it is what `uploadDocument` does - a booking voucher is a customer's
// paperwork and is served only through an authenticated admin route.
//
// Cover images are a different case, and treating them the same would break
// the site. A package's cover image is rendered on the public website to every
// visitor, so it has to be publicly fetchable by definition; serving it
// through a private, authenticated read would mean logged-out visitors see
// nothing. Vercel's own guidance is explicit that private access is not for
// files that need public delivery ("slow delivery and high egress costs").
//
// What images get instead is the part of the requirement that does apply to
// them:
//   - the store is not publicly listable - listing needs the write token,
//     which never leaves the server
//   - `addRandomSuffix` puts a random string in every pathname, so a URL
//     cannot be guessed from the file name
//   - uploads are gated behind the same staff permission that owns the
//     content being edited
//
// So: images are unguessable-but-fetchable, documents are genuinely private.

const IMAGE_PREFIX = "images";
const DOCUMENT_PREFIX = "documents";

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024; // 8 MB
export const MAX_DOCUMENT_BYTES = 20 * 1024 * 1024; // 20 MB

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"] as const;

export const ACCEPTED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

/**
 * Whether a blob store is wired up. Every upload path checks this so a
 * deployment without the token degrades to the URL-only field it had before,
 * rather than showing staff an upload button that always fails.
 */
export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export type UploadResult = { url: string; pathname: string; contentType: string; size: number };
export type UploadFailure = { error: string };

/**
 * Identifies a file from its leading bytes rather than trusting the browser.
 *
 * `File.type` and the extension are both attacker-controlled: a request can
 * claim `image/png` while carrying anything at all. Since these files are
 * later served back to browsers, the only trustworthy signal is the content
 * itself.
 */
function sniffImageType(bytes: Uint8Array): string | null {
  const startsWith = (...sig: number[]) => sig.every((b, i) => bytes[i] === b);
  const ascii = (offset: number, text: string) =>
    [...text].every((ch, i) => bytes[offset + i] === ch.charCodeAt(0));

  if (startsWith(0xff, 0xd8, 0xff)) return "image/jpeg";
  if (startsWith(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "image/png";
  if (ascii(0, "GIF87a") || ascii(0, "GIF89a")) return "image/gif";
  // RIFF....WEBP - the four bytes between are the little-endian file size.
  if (ascii(0, "RIFF") && ascii(8, "WEBP")) return "image/webp";
  // ISO-BMFF: size, then "ftyp", then the brand.
  if (ascii(4, "ftyp") && (ascii(8, "avif") || ascii(8, "avis"))) return "image/avif";

  return null;
}

function sniffDocumentType(bytes: Uint8Array, declared: string): string | null {
  const ascii = (offset: number, text: string) =>
    [...text].every((ch, i) => bytes[offset + i] === ch.charCodeAt(0));

  if (ascii(0, "%PDF-")) return "application/pdf";
  // .docx is a zip container; .doc is an OLE compound file. Neither can be
  // told apart from other zip/OLE files by magic bytes alone, so the declared
  // type decides between them - but only after the container itself matches,
  // which still rules out an executable renamed to .docx.
  if (bytes[0] === 0x50 && bytes[1] === 0x4b && (bytes[2] === 0x03 || bytes[2] === 0x05)) {
    return declared === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ? declared
      : null;
  }
  if (ascii(0, "\xd0\xcf\x11\xe0")) {
    return declared === "application/msword" ? declared : null;
  }

  return null;
}

/** Strips everything that could steer the stored path somewhere unintended. */
function safeBaseName(name: string): string {
  const withoutExtension = name.replace(/\.[^.]+$/, "");
  const cleaned = withoutExtension
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    // Anything that isn't a plain letter or digit - including the "/" and ".."
    // a path-traversal attempt needs - becomes a hyphen.
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return cleaned || "file";
}

function extensionFor(contentType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
    "image/gif": "gif",
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  };
  return map[contentType] ?? "bin";
}

/**
 * Stores a staff-uploaded cover image and returns its URL.
 *
 * The returned URL is what gets written into the existing `image` column, so
 * nothing downstream has to know an upload happened - an uploaded image and a
 * pasted Unsplash link are the same kind of value.
 */
export async function uploadImage(file: File): Promise<UploadResult | UploadFailure> {
  if (!isBlobConfigured()) {
    return { error: "File uploads aren't set up yet. Paste an image URL instead." };
  }
  if (file.size === 0) return { error: "That file is empty." };
  if (file.size > MAX_IMAGE_BYTES) {
    return { error: `Images must be ${Math.round(MAX_IMAGE_BYTES / 1024 / 1024)} MB or smaller.` };
  }

  // Only the header is needed to identify the format, but the whole file has
  // to be read to upload it anyway.
  const buffer = new Uint8Array(await file.arrayBuffer());
  const contentType = sniffImageType(buffer);

  if (!contentType) {
    return { error: "That doesn't look like an image. Upload a JPG, PNG, WebP, AVIF or GIF." };
  }
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(contentType)) {
    return { error: `${contentType} images aren't supported.` };
  }

  const pathname = `${IMAGE_PREFIX}/${safeBaseName(file.name)}.${extensionFor(contentType)}`;

  const blob = await put(pathname, Buffer.from(buffer), {
    access: "public",
    // Makes the final URL unguessable - the store can't be walked by trying
    // likely file names.
    addRandomSuffix: true,
    // The sniffed type, never the browser's claim.
    contentType,
    // Immutable in practice: the random suffix means a replacement gets its
    // own URL, so this one can be cached hard.
    cacheControlMaxAge: 60 * 60 * 24 * 365,
  });

  return { url: blob.url, pathname: blob.pathname, contentType, size: file.size };
}

/**
 * Stores a private document (a booking voucher). Not publicly readable - it
 * comes back only through an authenticated admin route via
 * `readPrivateDocument`.
 */
export async function uploadDocument(file: File): Promise<UploadResult | UploadFailure> {
  if (!isBlobConfigured()) {
    return { error: "File uploads aren't set up yet." };
  }
  if (file.size === 0) return { error: "That file is empty." };
  if (file.size > MAX_DOCUMENT_BYTES) {
    return { error: `Documents must be ${Math.round(MAX_DOCUMENT_BYTES / 1024 / 1024)} MB or smaller.` };
  }

  const buffer = new Uint8Array(await file.arrayBuffer());
  const contentType = sniffDocumentType(buffer, file.type);

  if (!contentType) {
    return { error: "Upload a PDF or Word document." };
  }

  const pathname = `${DOCUMENT_PREFIX}/${safeBaseName(file.name)}.${extensionFor(contentType)}`;

  const blob = await put(pathname, Buffer.from(buffer), {
    access: "private",
    addRandomSuffix: true,
    contentType,
  });

  return { url: blob.url, pathname: blob.pathname, contentType, size: file.size };
}

/** Reads a private document back for an already-authenticated request. */
export async function readPrivateDocument(url: string) {
  // useCache:false - a voucher is fetched rarely and re-uploaded when it
  // changes, so correctness matters more than shaving a CDN round trip.
  return get(url, { access: "private", useCache: false });
}

/**
 * Removes a stored file. Deliberately forgiving: a blob that is already gone,
 * or a value that was a pasted URL rather than an upload, must not fail the
 * surrounding operation - the record being deleted matters more than tidying
 * up a file.
 */
export async function deleteBlob(url: string): Promise<void> {
  if (!isBlobConfigured() || !isBlobUrl(url)) return;
  try {
    await del(url);
  } catch {
    // Nothing to do: the file is either already gone or unreachable, and
    // neither is worth surfacing to whoever pressed Delete.
  }
}

/** True for URLs this app uploaded, as opposed to a pasted third-party link. */
export function isBlobUrl(value: string): boolean {
  try {
    return new URL(value).hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}
