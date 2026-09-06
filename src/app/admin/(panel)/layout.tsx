import type { ReactNode } from "react";
import type { Metadata } from "next";
import {
  Activity,
  Award,
  BarChart3,
  BedDouble,
  CalendarCheck,
  CheckCircle2,
  Download,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  MapPin,
  Newspaper,
  Package,
  Plane,
  Receipt,
  Search,
  Settings,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import { requireSession } from "@/lib/dal";
import { db } from "@/lib/db";
import PanelShell from "@/components/admin/PanelShell";

export const metadata: Metadata = {
  title: "Admin | Snapingo",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireSession(["ADMIN"]);
  const newLeadCount = await db.lead.count({ where: { status: "NEW" } });

  return (
    <PanelShell
      title="Admin Panel"
      rootHref="/admin"
      sections={[
        {
          items: [{ href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-full w-full" /> }],
        },
        {
          heading: "Content",
          items: [
            { href: "/admin/cms/packages", label: "Packages", icon: <Package className="h-full w-full" /> },
            { href: "/admin/cms/destinations", label: "Destinations", icon: <MapPin className="h-full w-full" /> },
            { href: "/admin/cms/services", label: "Services", icon: <Wrench className="h-full w-full" /> },
            { href: "/admin/cms/blog", label: "Blog", icon: <Newspaper className="h-full w-full" /> },
            { href: "/admin/cms/faq", label: "FAQ", icon: <HelpCircle className="h-full w-full" /> },
            { href: "/admin/reviews", label: "Reviews", icon: <Star className="h-full w-full" /> },
            { href: "/admin/cms/hotels", label: "Hotels", icon: <BedDouble className="h-full w-full" /> },
            { href: "/admin/cms/flights", label: "Flights", icon: <Plane className="h-full w-full" /> },
            { href: "/admin/cms/service-categories", label: "Homepage Categories", icon: <LayoutGrid className="h-full w-full" /> },
            { href: "/admin/cms/trust-logos", label: "Trust Logos", icon: <Award className="h-full w-full" /> },
            { href: "/admin/cms/usps", label: "Why Choose Us", icon: <Sparkles className="h-full w-full" /> },
          ],
        },
        {
          heading: "Leads & Bookings",
          items: [
            { href: "/admin/search", label: "Customer Search", icon: <Search className="h-full w-full" /> },
            { href: "/admin/leads", label: "Leads", icon: <Inbox className="h-full w-full" />, badge: newLeadCount },
            { href: "/admin/activities", label: "Lead Activities", icon: <Activity className="h-full w-full" /> },
            { href: "/admin/bookings", label: "Booking Management", icon: <CalendarCheck className="h-full w-full" /> },
            { href: "/admin/trips", label: "Complete Trips", icon: <CheckCircle2 className="h-full w-full" /> },
            { href: "/admin/payments", label: "Payments", icon: <Wallet className="h-full w-full" /> },
            { href: "/admin/invoices", label: "Invoices", icon: <Receipt className="h-full w-full" /> },
          ],
        },
        {
          heading: "Insights",
          items: [
            { href: "/admin/reports", label: "Lead Report", icon: <BarChart3 className="h-full w-full" /> },
            { href: "/admin/call-export", label: "Call Export", icon: <Download className="h-full w-full" /> },
            { href: "/admin/performance", label: "Performance", icon: <TrendingUp className="h-full w-full" /> },
          ],
        },
        {
          heading: "Admin",
          items: [
            { href: "/admin/team", label: "Staff Accounts", icon: <Users className="h-full w-full" /> },
            { href: "/admin/settings", label: "Settings", icon: <Settings className="h-full w-full" /> },
          ],
        },
      ]}
    >
      {children}
    </PanelShell>
  );
}
