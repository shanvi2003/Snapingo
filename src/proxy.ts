import { NextRequest, NextResponse } from "next/server";
import { decrypt, SESSION_COOKIE } from "@/lib/session";
import { staffCan, type StaffFeature } from "@/lib/permissions";

// Next.js 16 renamed middleware.ts -> proxy.ts (same mechanics, new name).
//
// This is the *real* enforcement point for page-level route access, not just
// an optimistic pre-check: a redirect() thrown deep inside a page during
// render only degrades to a client-side meta-refresh once the response has
// started streaming (root loading.tsx wraps every route in an implicit
// Suspense boundary), and non-JS clients - curl, bots, a bookmarked hard
// navigation - never follow that. Only a redirect issued here, before any
// rendering starts, is guaranteed for every client. jobRole is baked into
// the session JWT (see src/lib/session.ts) specifically so this check needs
// no DB round-trip. requireSession()/requireStaffFeature() in src/lib/dal.ts
// still independently re-verify in every layout and every gated Server
// Action - those stay authoritative for mutations and catch a jobRole
// change made mid-session (the JWT only refreshes on next login).
const protectedPrefixes = ["/admin", "/staff", "/api/admin"];

// Staff-panel route prefix -> the feature it requires (src/lib/permissions.ts).
// Order matters only in that no two prefixes here are prefixes of each other.
const staffFeatureRoutes: { prefix: string; feature: StaffFeature }[] = [
  { prefix: "/api/admin/leads/export", feature: "leads" },
  { prefix: "/staff/leads", feature: "leads" },
  { prefix: "/staff/search", feature: "customerSearch" },
  { prefix: "/staff/bookings", feature: "bookings" },
  { prefix: "/staff/trips", feature: "completeTrips" },
  { prefix: "/staff/cms/blog", feature: "blogEdit" },
  { prefix: "/staff/reviews", feature: "reviewsEdit" },
  { prefix: "/staff/cms/packages", feature: "contentEdit" },
  { prefix: "/staff/cms/destinations", feature: "contentEdit" },
  { prefix: "/staff/cms/services", feature: "contentEdit" },
  { prefix: "/staff/cms/faq", feature: "contentEdit" },
  { prefix: "/staff/cms/service-categories", feature: "contentEdit" },
  { prefix: "/staff/cms/trust-logos", feature: "contentEdit" },
  { prefix: "/staff/cms/usps", feature: "contentEdit" },
];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  // /staff/login is itself under the "/staff" prefix but must stay reachable
  // while signed out - it's staff's own dedicated entry URL (see below).
  if (pathname === "/staff/login") return NextResponse.next();

  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await decrypt(token);

  if (!session) {
    // Staff have their own login URL, separate from the admin one, so a
    // staff link never routes through /login.
    const loginUrl = new URL(pathname.startsWith("/staff") ? "/staff/login" : "/login", req.nextUrl);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/staff", req.nextUrl));
  }

  if (session.role === "STAFF") {
    const match = staffFeatureRoutes.find((r) => pathname.startsWith(r.prefix));
    if (match && !staffCan(session.jobRole, match.feature)) {
      // API routes get a plain 403, not a redirect to a webpage - the caller
      // (a download link, an export button) expects a file or an error, not HTML.
      if (pathname.startsWith("/api/")) {
        return new NextResponse("Forbidden", { status: 403 });
      }
      return NextResponse.redirect(new URL("/staff", req.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/staff/:path*", "/api/admin/:path*"],
};
