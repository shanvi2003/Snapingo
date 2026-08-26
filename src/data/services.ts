export type ServiceHighlight = {
  icon: string;
  title: string;
  desc: string;
};

export type Service = {
  slug: string;
  name: string;
  tagline: string;
  image: string;
  overview: string;
  highlights: ServiceHighlight[];
};

const img = (id: string) => `/images/unsplash/${id}.jpg`;

export const services: Service[] = [
  {
    slug: "flights",
    name: "Flights",
    tagline: "Domestic & international fares",
    image: img("1436491865332-7a61a109cc05"),
    overview:
      "Snapingo books flights across every major domestic and international airline, so you get the right connection at the right price without comparing ten different apps yourself.",
    highlights: [
      { icon: "Search", title: "Compare Fares", desc: "We check multiple airlines and route options to find the best combination of price and timing." },
      { icon: "RefreshCcw", title: "Flexible Ticketing", desc: "Guidance on reschedule and cancellation policies before you book, not after." },
      { icon: "Users", title: "Group & Family Bookings", desc: "Seat blocks and coordinated PNRs for groups traveling together." },
      { icon: "Headset", title: "24/7 Support", desc: "A real person on WhatsApp if your flight gets rescheduled or cancelled." },
    ],
  },
  {
    slug: "hotels",
    name: "Hotels",
    tagline: "Handpicked stays, every budget",
    image: img("1566073771259-6a8506099945"),
    overview:
      "We book stays through our hotel partners, from budget-friendly properties to well-known chains, matched to your destination, budget and travel dates.",
    highlights: [
      { icon: "BadgeCheck", title: "Verified Properties", desc: "Every hotel we book is checked for cleanliness, location and guest ratings before it's recommended." },
      { icon: "Wallet", title: "Every Budget", desc: "From backpacker-friendly stays to premium resorts, matched to what you actually want to spend." },
      { icon: "Handshake", title: "Direct Partner Rates", desc: "Booked through our hotel partners, often at better rates than public listing sites." },
      { icon: "CalendarClock", title: "Easy Changes", desc: "Need to switch rooms or dates? We handle it directly with the property." },
    ],
  },
  {
    slug: "cabs-transfers",
    name: "Cabs & Transfers",
    tagline: "Airport & local transport",
    image: img("1449965408869-eaa3f722e40d"),
    overview:
      "Airport pickups, intercity drops and full-day local cabs, booked in advance so you're not negotiating a fare the moment you land.",
    highlights: [
      { icon: "PlaneLanding", title: "Airport Transfers", desc: "Pre-booked pickup and drop, with the driver tracking your flight for delays." },
      { icon: "Route", title: "Outstation Cabs", desc: "One-way and round-trip intercity travel in a car that suits your group size." },
      { icon: "MapPin", title: "Local Sightseeing", desc: "Full-day or half-day cabs for local sightseeing at your own pace." },
      { icon: "ShieldCheck", title: "Verified Drivers", desc: "Every driver is vetted before being assigned to a Snapingo booking." },
    ],
  },
  {
    slug: "travel-guide",
    name: "Travel Guide",
    tagline: "Plan your trip through our website",
    image: img("1524850011238-e3d235c7d4c9"),
    overview:
      "No agent, no waiting for a callback. Browse destinations, compare packages and put together your own itinerary directly on Snapingo, then confirm the details with our team on WhatsApp whenever you're ready.",
    highlights: [
      { icon: "Compass", title: "Browse Destinations", desc: "Explore 25 destinations with real pricing, best time to visit and duration guides." },
      { icon: "LayoutGrid", title: "Compare Packages", desc: "See inclusions, itineraries and pricing side-by-side before you decide." },
      { icon: "Sparkles", title: "Build Your Own Trip", desc: "Mix and match destinations, packages and services to fit exactly what you want." },
      { icon: "MessageCircle", title: "Confirm on WhatsApp", desc: "Once you've decided, confirm the details with a real person, no forms, no hold music." },
    ],
  },
];

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}
