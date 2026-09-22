// Single source of truth for which remote image hosts next/image is allowed
// to optimize (next.config.ts's remotePatterns), so every place that lets an
// admin/staff type in an image URL can enforce the same list at save-time
// instead of letting a bad URL reach production and crash next/image with
// an "invalid hostname" error at render time - taking down whatever public
// page renders it for every visitor until someone notices and fixes the row.
export const ALLOWED_IMAGE_HOSTS = ["images.unsplash.com", "randomuser.me"] as const;

// Our own blob store, where staff uploads land. The store id is part of the
// hostname and isn't known until the store is provisioned, so this is matched
// as a suffix rather than pinned to one exact host - and `next/image` is
// given the equivalent `**.public.blob.vercel-storage.com` wildcard.
//
// Only the `public.` variant is listed: a private blob is never rendered by
// next/image, it is streamed through an authenticated admin route instead.
export const BLOB_IMAGE_HOST_SUFFIX = ".public.blob.vercel-storage.com";
export const BLOB_IMAGE_HOST_PATTERN = `**${BLOB_IMAGE_HOST_SUFFIX}`;

export function isAllowedImageSource(value: string): boolean {
  if (value.startsWith("/")) return true; // local /public path
  try {
    const { hostname, protocol } = new URL(value);
    // A blob URL is always https; checking the protocol stops an http:// or
    // javascript: URL that merely ends with the right text from passing.
    if (protocol === "https:" && hostname.endsWith(BLOB_IMAGE_HOST_SUFFIX)) return true;
    return (ALLOWED_IMAGE_HOSTS as readonly string[]).includes(hostname);
  } catch {
    return false;
  }
}

export const imageSourceMessage = `Upload an image, or use a path starting with / (e.g. /partners/logo.png) or a URL from: ${ALLOWED_IMAGE_HOSTS.join(", ")}.`;
