import type { ReactNode } from "react";
import type { Metadata } from "next";
import {
  Award,
  BedDouble,
  CalendarCheck,
  CheckCircle2,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  MapPin,
  Newspaper,
  Package as PackageIcon,
  Plane,
  Search,
  Settings,
  Sparkles,
  Star,
  Wrench,
} from "lucide-react";
import { requireSession } from "@/lib/dal";
import { db } from "@/lib/db";
import { staffCan } from "@/lib/permissions";
import PanelShell, { type PanelNavSection } from "@/components/admin/PanelShell";

export const metadata: Metadata = {
  title: "Staff | Snapingo",
  robots: { index: false, follow: false },
};

export default async function StaffLayout({ children }: { children: ReactNode }) {
  const session = await requireSession(["ADMIN", "STAFF"]);
  const user = await db.staffUser.findUniqueOrThrow({ where: { id: session.userId } });

  // ADMIN accounts landing on /staff (e.g. testing) see everything; a real
  // STAFF account's nav is entirely driven by their jobRole permissions -
  // see src/lib/permissions.ts. This only controls what's *shown*; every
  // page/action re-checks via requireStaffFeature() regardless.
  const isAdmin = user.role === "ADMIN";
  const can = (feature: Parameters<typeof staffCan>[1]) => isAdmin || staffCan(user.jobRole, feature);

  const newLeadCount = can("leads") ? await db.lead.count({ where: { status: "NEW" } }) : 0;

  const sections: PanelNavSection[] = [
    { items: [{ href: "/staff", label: "Dashboard", icon: <LayoutDashboard className="h-full w-full" /> }] },
  ];

  const leadsBookingsItems = [
    can("leads") && { href: "/staff/leads", label: "Leads", icon: <Inbox className="h-full w-full" />, badge: newLeadCount },
    can("customerSearch") && { href: "/staff/search", label: "Customer Search", icon: <Search className="h-full w-full" /> },
    can("bookings") && { href: "/staff/bookings", label: "Booking Management", icon: <CalendarCheck className="h-full w-full" /> },
    can("completeTrips") && { href: "/staff/trips", label: "Complete Trips", icon: <CheckCircle2 className="h-full w-full" /> },
  ].filter(Boolean) as PanelNavSection["items"];
  if (leadsBookingsItems.length > 0) {
    sections.push({ heading: "Leads & Bookings", items: leadsBookingsItems });
  }

  const contentEditItems = [
    can("contentEdit") && { href: "/staff/cms/packages", label: "Packages", icon: <PackageIcon className="h-full w-full" /> },
    can("contentEdit") && { href: "/staff/cms/destinations", label: "Destinations", icon: <MapPin className="h-full w-full" /> },
    can("contentEdit") && { href: "/staff/cms/services", label: "Services", icon: <Wrench className="h-full w-full" /> },
    can("contentEdit") && { href: "/staff/cms/faq", label: "FAQ", icon: <HelpCircle className="h-full w-full" /> },
    can("blogEdit") && { href: "/staff/cms/blog", label: "Blog", icon: <Newspaper className="h-full w-full" /> },
    can("reviewsEdit") && { href: "/staff/reviews", label: "Reviews", icon: <Star className="h-full w-full" /> },
    can("contentEdit") && { href: "/staff/cms/service-categories", label: "Homepage Categories", icon: <LayoutGrid className="h-full w-full" /> },
    can("contentEdit") && { href: "/staff/cms/trust-logos", label: "Trust Logos", icon: <Award className="h-full w-full" /> },
    can("contentEdit") && { href: "/staff/cms/usps", label: "Why Choose Us", icon: <Sparkles className="h-full w-full" /> },
  ].filter(Boolean) as PanelNavSection["items"];
  if (contentEditItems.length > 0) {
    sections.push({ heading: "Content", items: contentEditItems });
  }

  // Read-only reference browse - available to every staff role. Packages and
  // Destinations are skipped for Digital Marketing since their editable
  // versions above already let them view.
  const referenceItems = [
    !can("contentEdit") && { href: "/staff/packages", label: "Packages", icon: <PackageIcon className="h-full w-full" /> },
    !can("contentEdit") && { href: "/staff/destinations", label: "Destinations", icon: <MapPin className="h-full w-full" /> },
    { href: "/staff/hotels", label: "Hotels", icon: <BedDouble className="h-full w-full" /> },
    { href: "/staff/flights", label: "Flights", icon: <Plane className="h-full w-full" /> },
  ].filter(Boolean) as PanelNavSection["items"];
  sections.push({ heading: "Reference", items: referenceItems });

  sections.push({
    items: [{ href: "/staff/settings", label: "Settings", icon: <Settings className="h-full w-full" /> }],
  });

  return (
    <PanelShell
      title="Staff Panel"
      rootHref="/staff"
      sections={sections}
    >
      {children}
    </PanelShell>
  );
}
