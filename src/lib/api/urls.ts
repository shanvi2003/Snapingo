import "server-only";
import type { NextRequest } from "next/server";

// Every image/logo/avatar field in the content models is stored as a
// site-relative path (e.g. "/images/unsplash/xxx.jpg") - that's all the
// website itself ever needs, since the browser resolves it against whatever
// domain it's already on. A mobile app has no such "current domain" to
// resolve against, so every /api/v1/* response needs these turned into full
// URLs. Built from the incoming request's own origin (not a hardcoded
// domain) so this transparently returns the right thing whether the app hit
// http://10.0.2.2:3000 in the emulator, http://192.168.x.x:3000 over the LAN,
// or https://snapingo.com in production.
//
// Deliberately reads the raw Host header instead of request.nextUrl.origin:
// Next only builds nextUrl from the incoming Host when
// experimental.trustHostHeader is on (Vercel enables it automatically in
// production, but it isn't a settable next.config option), so in local dev
// nextUrl.origin is always "localhost", no matter what host/IP the client
// actually connected through. That's harmless for a browser on the same
// machine but breaks a phone on the LAN: it reaches /api/v1/* fine over
// 192.168.x.x, then every image URL in the JSON comes back pointing at
// "localhost", which resolves to the phone itself.
function requestOrigin(request: NextRequest): string {
  const proto = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? request.nextUrl.host;
  return `${proto}://${host}`;
}

export function absoluteUrl(request: NextRequest, path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return new URL(path, requestOrigin(request)).toString();
}

export function absoluteUrls(request: NextRequest, paths: string[]): string[] {
  return paths.map((p) => absoluteUrl(request, p));
}
