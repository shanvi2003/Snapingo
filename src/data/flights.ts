export type FlightClass = "economy" | "premium-economy" | "business" | "first";

export type Flight = {
  id: string;
  airline: string;
  departureCitySlug: string;
  destinationSlug: string;
  flightClass: FlightClass;
  price: number;
  duration: string;
};

export const majorIndianCities: { slug: string; name: string }[] = [
  { slug: "delhi", name: "New Delhi (DEL)" },
  { slug: "mumbai", name: "Mumbai (BOM)" },
  { slug: "bangalore", name: "Bangalore (BLR)" },
  { slug: "kolkata", name: "Kolkata (CCU)" },
  { slug: "chennai", name: "Chennai (MAA)" },
  { slug: "hyderabad", name: "Hyderabad (HYD)" },
  { slug: "pune", name: "Pune (PNQ)" },
  { slug: "ahmedabad", name: "Ahmedabad (AMD)" },
  { slug: "goa", name: "Goa (GOI)" },
  { slug: "kochi", name: "Kochi (COK)" },
];

export const flightClassOptions: { value: FlightClass; label: string }[] = [
  { value: "economy", label: "Economy" },
  { value: "premium-economy", label: "Premium Economy" },
  { value: "business", label: "Business" },
  { value: "first", label: "First Class" },
];

export const flightClassLabels: Record<FlightClass, string> = {
  economy: "Economy",
  "premium-economy": "Premium Economy",
  business: "Business",
  first: "First Class",
};

export const flights: Flight[] = [
  // Delhi -> Goa
  { id: "del-goa-indigo-eco", airline: "IndiGo", departureCitySlug: "delhi", destinationSlug: "goa", flightClass: "economy", price: 4499, duration: "2h 40m" },
  { id: "del-goa-vistara-biz", airline: "Vistara", departureCitySlug: "delhi", destinationSlug: "goa", flightClass: "business", price: 16999, duration: "2h 35m" },

  // Mumbai -> Goa
  { id: "bom-goa-indigo-eco", airline: "IndiGo", departureCitySlug: "mumbai", destinationSlug: "goa", flightClass: "economy", price: 2999, duration: "1h 15m" },
  { id: "bom-goa-airindia-premium", airline: "Air India", departureCitySlug: "mumbai", destinationSlug: "goa", flightClass: "premium-economy", price: 6499, duration: "1h 20m" },

  // Delhi -> Kerala
  { id: "del-kerala-indigo-eco", airline: "IndiGo", departureCitySlug: "delhi", destinationSlug: "kerala", flightClass: "economy", price: 5999, duration: "3h 10m" },
  { id: "del-kerala-airindia-biz", airline: "Air India", departureCitySlug: "delhi", destinationSlug: "kerala", flightClass: "business", price: 21999, duration: "3h 05m" },

  // Mumbai -> Kerala
  { id: "bom-kerala-indigo-eco", airline: "IndiGo", departureCitySlug: "mumbai", destinationSlug: "kerala", flightClass: "economy", price: 4499, duration: "1h 55m" },
  { id: "bom-kerala-vistara-premium", airline: "Vistara", departureCitySlug: "mumbai", destinationSlug: "kerala", flightClass: "premium-economy", price: 8999, duration: "1h 50m" },

  // Delhi -> Kashmir
  { id: "del-kashmir-indigo-eco", airline: "IndiGo", departureCitySlug: "delhi", destinationSlug: "kashmir", flightClass: "economy", price: 4999, duration: "1h 30m" },
  { id: "del-kashmir-spicejet-eco", airline: "SpiceJet", departureCitySlug: "delhi", destinationSlug: "kashmir", flightClass: "economy", price: 4299, duration: "1h 35m" },

  // Mumbai -> Kashmir
  { id: "bom-kashmir-airindia-biz", airline: "Air India", departureCitySlug: "mumbai", destinationSlug: "kashmir", flightClass: "business", price: 19999, duration: "2h 45m" },

  // Delhi -> Dubai
  { id: "del-dubai-indigo-eco", airline: "IndiGo", departureCitySlug: "delhi", destinationSlug: "dubai", flightClass: "economy", price: 14999, duration: "3h 45m" },
  { id: "del-dubai-emirates-business", airline: "Emirates", departureCitySlug: "delhi", destinationSlug: "dubai", flightClass: "business", price: 68999, duration: "3h 40m" },
  { id: "del-dubai-emirates-first", airline: "Emirates", departureCitySlug: "delhi", destinationSlug: "dubai", flightClass: "first", price: 145999, duration: "3h 40m" },

  // Mumbai -> Dubai
  { id: "bom-dubai-emirates-eco", airline: "Emirates", departureCitySlug: "mumbai", destinationSlug: "dubai", flightClass: "economy", price: 13499, duration: "3h 15m" },
  { id: "bom-dubai-emirates-premium", airline: "Emirates", departureCitySlug: "mumbai", destinationSlug: "dubai", flightClass: "premium-economy", price: 28999, duration: "3h 15m" },

  // Delhi -> Bali
  { id: "del-bali-vistara-eco", airline: "Vistara", departureCitySlug: "delhi", destinationSlug: "bali", flightClass: "economy", price: 27999, duration: "8h 20m" },
  { id: "del-bali-singapore-business", airline: "Singapore Airlines", departureCitySlug: "delhi", destinationSlug: "bali", flightClass: "business", price: 89999, duration: "8h 50m" },

  // Mumbai -> Bali
  { id: "bom-bali-vistara-eco", airline: "Vistara", departureCitySlug: "mumbai", destinationSlug: "bali", flightClass: "economy", price: 24999, duration: "9h 10m" },

  // Delhi -> Thailand
  { id: "del-thailand-airasia-eco", airline: "AirAsia", departureCitySlug: "delhi", destinationSlug: "thailand", flightClass: "economy", price: 12999, duration: "4h 30m" },
  { id: "del-thailand-thaiairways-business", airline: "Thai Airways", departureCitySlug: "delhi", destinationSlug: "thailand", flightClass: "business", price: 54999, duration: "4h 25m" },

  // Mumbai -> Thailand
  { id: "bom-thailand-airasia-eco", airline: "AirAsia", departureCitySlug: "mumbai", destinationSlug: "thailand", flightClass: "economy", price: 11499, duration: "5h 05m" },
  { id: "bom-thailand-thaiairways-premium", airline: "Thai Airways", departureCitySlug: "mumbai", destinationSlug: "thailand", flightClass: "premium-economy", price: 23999, duration: "5h 00m" },

  // Delhi -> Maldives
  { id: "del-maldives-indigo-eco", airline: "IndiGo", departureCitySlug: "delhi", destinationSlug: "maldives", flightClass: "economy", price: 18999, duration: "5h 10m" },
  { id: "del-maldives-qatar-business", airline: "Qatar Airways", departureCitySlug: "delhi", destinationSlug: "maldives", flightClass: "business", price: 72999, duration: "6h 40m" },

  // Mumbai -> Maldives
  { id: "bom-maldives-indigo-eco", airline: "IndiGo", departureCitySlug: "mumbai", destinationSlug: "maldives", flightClass: "economy", price: 15999, duration: "3h 20m" },
];

export function getFlightsByFilter({
  departureCitySlug,
  destinationSlug,
  flightClass,
}: {
  departureCitySlug: string;
  destinationSlug: string;
  flightClass: FlightClass;
}): Flight[] {
  return flights.filter(
    (f) =>
      f.departureCitySlug === departureCitySlug &&
      f.destinationSlug === destinationSlug &&
      f.flightClass === flightClass
  );
}
