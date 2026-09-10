import { NextRequest, NextResponse } from "next/server";
import { decrypt, SESSION_COOKIE } from "@/lib/session";
import { hasFeature, type StaffFeature } from "@/lib/permissions";
import { getRolePermissions } from "@/lib/rolePermissions";

// Next.js 16 renamed middleware.ts -> proxy.ts (same mechanics, new name),
// and Proxy defaults to the Node.js runtime (not Edge) - which is what
// makes the DB read below safe to do here at all.
//
// This is the *real* enforcement point for page-level route access, not just
// an optimistic pre-check: a redirect() thrown deep inside a page during
// render only degrades to a client-side meta-refresh once the response has
// started streaming (root loading.tsx wraps every route in an implicit
// Suspense boundary), and non-JS clients - curl, bots, a bookmarked hard
// navigation - never follow that. Only a redirect issued here, before any
// rendering starts, is guaranteed for every client. The feature check reads
// the role's current permissions fresh from the DB (see
// src/lib/rolePermissions.ts) on every request, so an admin granting a role
// new access on /admin/permissions takes effect immediately, not on next
// login - jobRole itself still comes from the session JWT (see
// src/lib/session.ts), so a *role reassignment* still only takes effect on
// next login. requireSession()/requireStaffFeature() in src/lib/dal.ts still
// independently re-verify in every layout and every gated Server Action -
// those stay authoritative for mutations.

// The only hostnames this app should ever be reached at in production. A
// mismatch (e.g. a third-party clone/mirror whose DNS or reverse proxy
// happens to point at this deployment) gets bounced to the canonical
// domain instead of being served. Scoped to VERCEL_ENV === "production" so
// it never interferes with Vercel's own per-branch/PR preview URLs (those
// are *.vercel.app aliases outside this exact list) or local dev.
const allowedProductionHosts = new Set(["snapingo.com", "www.snapingo.com", "snapingo.vercel.app"]);

const protectedPrefixes = ["/admin", "/staff", "/api/admin"];

// Staff-panel route prefix -> the feature it requires (src/lib/permissions.ts).
// Order matters only in that no two prefixes here are prefixes of each other.
const staffFeatureRoutes: { prefix: string; feature: StaffFeature }[] = [
  { prefix: "/api/admin/leads/export", feature: "leads" },
  { prefix: "/staff/leads", feature: "leads" },
  { prefix: "/staff/activities", feature: "leadActivities" },
  { prefix: "/staff/search", feature: "customerSearch" },
  { prefix: "/staff/bookings", feature: "bookings" },
  { prefix: "/staff/trips", feature: "completeTrips" },
  { prefix: "/staff/cms/blog", feature: "blogEdit" },
  { prefix: "/staff/reviews", feature: "reviewsEdit" },
  { prefix: "/staff/cms/packages", feature: "packagesEdit" },
  { prefix: "/staff/cms/destinations", feature: "destinationsEdit" },
  { prefix: "/staff/cms/hotels", feature: "hotelsEdit" },
  { prefix: "/staff/cms/flights", feature: "flightsEdit" },
  { prefix: "/staff/cms/services", feature: "contentEdit" },
  { prefix: "/staff/cms/faq", feature: "contentEdit" },
  { prefix: "/staff/cms/service-categories", feature: "contentEdit" },
  { prefix: "/staff/cms/trust-logos", feature: "contentEdit" },
  { prefix: "/staff/cms/usps", feature: "contentEdit" },
];

export default async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (process.env.VERCEL_ENV === "production" && !allowedProductionHosts.has(req.nextUrl.hostname)) {
    const canonical = new URL(req.nextUrl.pathname + req.nextUrl.search, "https://snapingo.com");
    return NextResponse.redirect(canonical, 308);
  }

  // Legacy bookmark for the old admin login URL. A page-level redirect()
  // here would suffer the exact same streaming problem described above (curl
  // /login only gets a "Loading..." shell, never the redirect) since
  // root loading.tsx wraps it in a Suspense boundary too - issuing it here
  // instead is what makes it actually reach every client.
  if (pathname === "/login") return NextResponse.redirect(new URL("/admin/login", req.nextUrl), 308);

  // /staff/login and /admin/login are each under their own protected prefix
  // but must stay reachable while signed out - they're the dedicated entry
  // URLs for each panel (see below).
  if (pathname === "/staff/login" || pathname === "/admin/login") return NextResponse.next();

  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await decrypt(token);

  if (!session) {
    // Staff have their own login URL, separate from the admin one.
    const loginUrl = new URL(pathname.startsWith("/staff") ? "/staff/login" : "/admin/login", req.nextUrl);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && session.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/staff", req.nextUrl));
  }

  if (session.role === "STAFF") {
    const match = staffFeatureRoutes.find((r) => pathname.startsWith(r.prefix));
    const features = match && session.jobRole ? await getRolePermissions(session.jobRole) : [];
    if (match && !hasFeature(features, match.feature)) {
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
  // Broad on purpose: the host check up top must run for every page, not
  // just the protected admin/staff prefixes. Static assets and the image
  // optimizer are excluded so this never adds latency to CSS/JS/image
  // requests (see the proxy docs' warning about unscoped matchers).
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"],
};
