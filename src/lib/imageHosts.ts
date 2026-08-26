// Single source of truth for which remote image hosts next/image is allowed
// to optimize (next.config.ts's remotePatterns), so every place that lets an
// admin/staff type in an image URL can enforce the same list at save-time
// instead of letting a bad URL reach production and crash next/image with
// an "invalid hostname" error at render time - taking down whatever public
// page renders it for every visitor until someone notices and fixes the row.
export const ALLOWED_IMAGE_HOSTS = ["images.unsplash.com", "randomuser.me"] as const;

export function isAllowedImageSource(value: string): boolean {
  if (value.startsWith("/")) return true; // local /public path
  try {
    return (ALLOWED_IMAGE_HOSTS as readonly string[]).includes(new URL(value).hostname);
  } catch {
    return false;
  }
}

export const imageSourceMessage = `Must be a path starting with / (e.g. /partners/logo.png) or a URL from: ${ALLOWED_IMAGE_HOSTS.join(", ")}.`;
