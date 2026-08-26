import type { ReactNode } from "react";
import OfferBar from "@/components/OfferBar";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import TripPlannerModal from "@/components/TripPlannerModal";
import Analytics from "@/components/Analytics";
import { getAllDestinations } from "@/lib/content/destinations";
import { getAllServices } from "@/lib/content/services";

// Public marketing site chrome (offer bar, nav, footer, WhatsApp buttons,
// the trip-planner popup) - scoped to this route group so /login, /admin
// and /staff (siblings of (site), not nested under it) never inherit it.
export default async function SiteLayout({ children }: { children: ReactNode }) {
  const [destinations, services] = await Promise.all([getAllDestinations(), getAllServices()]);

  return (
    <>
      <Analytics />
      <OfferBar />
      <main className="relative flex-1">
        <Navbar destinations={destinations} services={services} />
        {children}
      </main>
      <Footer />
      <FloatingButtons />
      <TripPlannerModal destinations={destinations} />
    </>
  );
}
