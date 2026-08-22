export const navLinks = [
  { label: "Domestic", href: "/destinations?type=domestic" },
  { label: "International", href: "/destinations?type=international" },
  { label: "Packages", href: "/packages" },
  { label: "Services", href: "/services" },
  { label: "About Us", href: "/about" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export const hotDealsLink = { label: "Hot Deals", href: "/hot-deals" };

const catImg = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&crop=entropy&w=900&h=1200&q=90`;

export const serviceCategories = [
  {
    icon: "Plane",
    label: "Flights",
    desc: "Domestic & international fares",
    image: catImg("1436491865332-7a61a109cc05"),
  },
  {
    icon: "BedDouble",
    label: "Hotels",
    desc: "Handpicked stays, every budget",
    image: catImg("1566073771259-6a8506099945"),
  },
  {
    icon: "Package",
    label: "Holiday Packages",
    desc: "All-inclusive itineraries",
    image: catImg("1520250497591-112f2f40a3f4"),
  },
  {
    icon: "Heart",
    label: "Honeymoon",
    desc: "Curated romantic getaways",
    image: catImg("1516589178581-6cd7833ae3b2"),
  },
  {
    icon: "Users",
    label: "Group Tours",
    desc: "Travel with like-minded people",
    image: catImg("1529333166437-7750a6dd5a70"),
  },
  {
    icon: "Car",
    label: "Cabs & Transfers",
    desc: "Airport & local transport",
    image: catImg("1449965408869-eaa3f722e40d"),
  },
] as const;

export const trustLogos = [
  { name: "IndiGo", category: "airline", logo: "/partners/indigo.png" },
  { name: "Air India", category: "airline", logo: "/partners/air-india.png" },
  { name: "Vistara", category: "airline", logo: "/partners/vistara.png" },
  { name: "Emirates", category: "airline", logo: "/partners/emirates.png" },
  { name: "Qatar Airways", category: "airline", logo: "/partners/qatar-airways.png" },
  { name: "Singapore Airlines", category: "airline", logo: "/partners/singapore-airlines.png" },
  { name: "Marriott", category: "hotel", logo: "/partners/marriott.png" },
  { name: "Taj Hotels", category: "hotel", logo: "/partners/taj-hotels.png" },
  { name: "ITC Hotels", category: "hotel", logo: "/partners/itc-hotels.png" },
  { name: "OYO", category: "hotel", logo: "/partners/oyo.png" },
] as const;

export const usps = [
  {
    icon: "ShieldCheck",
    title: "Best Price Guarantee",
    desc: "Handpicked packages priced to beat the market, or we match it.",
  },
  {
    icon: "Headset",
    title: "24/7 Trip Support",
    desc: "A real human on WhatsApp & call throughout your journey, not just at booking.",
  },
  {
    icon: "PackageCheck",
    title: "All-Inclusive Packages",
    desc: "Flights, stay, transfers, meals & sightseeing bundled, no hidden add-ons.",
  },
  {
    icon: "MapPinned",
    title: "25 Destinations",
    desc: "From weekend hills to bucket-list islands, domestic and international.",
  },
];
