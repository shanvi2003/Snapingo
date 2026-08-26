export type HotelCategory = "3-star" | "4-star" | "5-star" | "luxury";

export type Hotel = {
  id: string;
  name: string;
  destinationSlug: string;
  category: HotelCategory;
  pricePerNight: number;
  rating: number;
};

export const hotelCategoryOptions: { value: HotelCategory; label: string }[] = [
  { value: "3-star", label: "3-Star" },
  { value: "4-star", label: "4-Star" },
  { value: "5-star", label: "5-Star" },
  { value: "luxury", label: "Luxury" },
];

export const hotelCategoryLabels: Record<HotelCategory, string> = {
  "3-star": "3-Star",
  "4-star": "4-Star",
  "5-star": "5-Star",
  luxury: "Luxury",
};

export type PriceRange = "any" | "under-5k" | "5k-10k" | "10k-20k" | "20k-plus";

export const priceRangeOptions: { value: PriceRange; label: string }[] = [
  { value: "any", label: "Any Price" },
  { value: "under-5k", label: "Under ₹5,000" },
  { value: "5k-10k", label: "₹5,000 – ₹10,000" },
  { value: "10k-20k", label: "₹10,000 – ₹20,000" },
  { value: "20k-plus", label: "₹20,000+" },
];

export const priceRangeLabels: Record<PriceRange, string> = {
  any: "Any Price",
  "under-5k": "Under ₹5,000/person",
  "5k-10k": "₹5,000 – ₹10,000/person",
  "10k-20k": "₹10,000 – ₹20,000/person",
  "20k-plus": "₹20,000+/person",
};

function matchesPriceRange(price: number, range: PriceRange): boolean {
  switch (range) {
    case "under-5k":
      return price < 5000;
    case "5k-10k":
      return price >= 5000 && price < 10000;
    case "10k-20k":
      return price >= 10000 && price < 20000;
    case "20k-plus":
      return price >= 20000;
    default:
      return true;
  }
}

export const hotels: Hotel[] = [
  // Goa
  { id: "goa-sea-breeze-inn", name: "Sea Breeze Inn, Calangute", destinationSlug: "goa", category: "3-star", pricePerNight: 2499, rating: 4.2 },
  { id: "goa-palm-grove-resort", name: "Palm Grove Resort, Candolim", destinationSlug: "goa", category: "4-star", pricePerNight: 4999, rating: 4.5 },
  { id: "goa-taj-holiday-village", name: "Taj Holiday Village, Sinquerim", destinationSlug: "goa", category: "5-star", pricePerNight: 11999, rating: 4.7 },
  { id: "goa-w-goa-vagator", name: "W Goa, Vagator", destinationSlug: "goa", category: "luxury", pricePerNight: 18999, rating: 4.8 },

  // Himachal Pradesh
  { id: "himachal-mall-view-inn", name: "Mall View Inn, Shimla", destinationSlug: "himachal", category: "3-star", pricePerNight: 2199, rating: 4.1 },
  { id: "himachal-snow-valley-resort", name: "Snow Valley Resort, Manali", destinationSlug: "himachal", category: "4-star", pricePerNight: 4499, rating: 4.4 },
  { id: "himachal-itc-manali", name: "ITC Welcomhotel, Manali", destinationSlug: "himachal", category: "5-star", pricePerNight: 10999, rating: 4.6 },
  { id: "himachal-oberoi-cecil", name: "The Oberoi Cecil, Shimla", destinationSlug: "himachal", category: "luxury", pricePerNight: 21999, rating: 4.9 },

  // Kerala
  { id: "kerala-backwater-inn", name: "Backwater Inn, Alleppey", destinationSlug: "kerala", category: "3-star", pricePerNight: 2699, rating: 4.2 },
  { id: "kerala-tea-county-munnar", name: "Tea County Resort, Munnar", destinationSlug: "kerala", category: "4-star", pricePerNight: 5299, rating: 4.5 },
  { id: "kerala-taj-kumarakom", name: "Taj Kumarakom Resort & Spa", destinationSlug: "kerala", category: "5-star", pricePerNight: 13999, rating: 4.7 },
  { id: "kerala-kumarakom-lake-resort", name: "Kumarakom Lake Resort", destinationSlug: "kerala", category: "luxury", pricePerNight: 22999, rating: 4.8 },

  // Rajasthan
  { id: "rajasthan-heritage-haveli-jaipur", name: "Heritage Haveli, Jaipur", destinationSlug: "rajasthan", category: "3-star", pricePerNight: 2399, rating: 4.1 },
  { id: "rajasthan-royal-orchid-udaipur", name: "Royal Orchid, Udaipur", destinationSlug: "rajasthan", category: "4-star", pricePerNight: 4799, rating: 4.4 },
  { id: "rajasthan-itc-rajputana", name: "ITC Rajputana, Jaipur", destinationSlug: "rajasthan", category: "5-star", pricePerNight: 12499, rating: 4.6 },
  { id: "rajasthan-taj-lake-palace", name: "Taj Lake Palace, Udaipur", destinationSlug: "rajasthan", category: "luxury", pricePerNight: 34999, rating: 4.9 },

  // Kashmir
  { id: "kashmir-dal-view-inn", name: "Dal View Inn, Srinagar", destinationSlug: "kashmir", category: "3-star", pricePerNight: 2799, rating: 4.0 },
  { id: "kashmir-heevan-resort", name: "The Heevan Resort, Pahalgam", destinationSlug: "kashmir", category: "4-star", pricePerNight: 5499, rating: 4.4 },
  { id: "kashmir-lalit-grand-palace", name: "The Lalit Grand Palace, Srinagar", destinationSlug: "kashmir", category: "5-star", pricePerNight: 13499, rating: 4.6 },
  { id: "kashmir-vivanta-dal-view", name: "Vivanta Dal View, Srinagar", destinationSlug: "kashmir", category: "luxury", pricePerNight: 19999, rating: 4.7 },

  // Uttarakhand
  { id: "uttarakhand-ganga-view-inn", name: "Ganga View Inn, Rishikesh", destinationSlug: "uttarakhand", category: "3-star", pricePerNight: 1999, rating: 4.1 },
  { id: "uttarakhand-riverside-resort-haridwar", name: "Riverside Resort, Haridwar", destinationSlug: "uttarakhand", category: "4-star", pricePerNight: 3999, rating: 4.3 },
  { id: "uttarakhand-taj-rishikesh", name: "Taj Rishikesh Resort & Spa", destinationSlug: "uttarakhand", category: "5-star", pricePerNight: 10999, rating: 4.6 },
  { id: "uttarakhand-ananda-himalayas", name: "Ananda in the Himalayas", destinationSlug: "uttarakhand", category: "luxury", pricePerNight: 32999, rating: 4.9 },

  // Bali
  { id: "bali-kuta-beach-inn", name: "Kuta Beach Inn", destinationSlug: "bali", category: "3-star", pricePerNight: 3299, rating: 4.2 },
  { id: "bali-ubud-garden-resort", name: "Ubud Garden Resort", destinationSlug: "bali", category: "4-star", pricePerNight: 6499, rating: 4.5 },
  { id: "bali-w-bali-seminyak", name: "W Bali, Seminyak", destinationSlug: "bali", category: "5-star", pricePerNight: 15999, rating: 4.7 },
  { id: "bali-four-seasons-sayan", name: "Four Seasons Resort, Sayan", destinationSlug: "bali", category: "luxury", pricePerNight: 38999, rating: 4.9 },

  // Dubai
  { id: "dubai-deira-comfort-inn", name: "Deira Comfort Inn", destinationSlug: "dubai", category: "3-star", pricePerNight: 4499, rating: 4.0 },
  { id: "dubai-marina-view-hotel", name: "Marina View Hotel", destinationSlug: "dubai", category: "4-star", pricePerNight: 8499, rating: 4.4 },
  { id: "dubai-jw-marriott-marquis", name: "JW Marriott Marquis, Business Bay", destinationSlug: "dubai", category: "5-star", pricePerNight: 17999, rating: 4.6 },
  { id: "dubai-burj-al-arab", name: "Burj Al Arab Jumeirah", destinationSlug: "dubai", category: "luxury", pricePerNight: 89999, rating: 4.9 },

  // Maldives
  { id: "maldives-lagoon-guesthouse", name: "Lagoon Guesthouse, Maafushi", destinationSlug: "maldives", category: "3-star", pricePerNight: 5999, rating: 4.1 },
  { id: "maldives-sun-island-resort", name: "Sun Island Resort", destinationSlug: "maldives", category: "4-star", pricePerNight: 12999, rating: 4.5 },
  { id: "maldives-taj-exotica", name: "Taj Exotica Resort & Spa", destinationSlug: "maldives", category: "5-star", pricePerNight: 28999, rating: 4.7 },
  { id: "maldives-soneva-fushi", name: "Soneva Fushi", destinationSlug: "maldives", category: "luxury", pricePerNight: 65999, rating: 4.9 },

  // Thailand
  { id: "thailand-patong-inn-phuket", name: "Patong Inn, Phuket", destinationSlug: "thailand", category: "3-star", pricePerNight: 2999, rating: 4.1 },
  { id: "thailand-riverside-resort-bangkok", name: "Riverside Resort, Bangkok", destinationSlug: "thailand", category: "4-star", pricePerNight: 5799, rating: 4.4 },
  { id: "thailand-anantara-phuket", name: "Anantara, Phuket Layan", destinationSlug: "thailand", category: "5-star", pricePerNight: 13999, rating: 4.7 },
  { id: "thailand-amanpuri-phuket", name: "Amanpuri, Phuket", destinationSlug: "thailand", category: "luxury", pricePerNight: 42999, rating: 4.9 },
];

export function getHotelsByFilter({
  destinationSlug,
  category,
  priceRange,
}: {
  destinationSlug: string;
  category: HotelCategory;
  priceRange: PriceRange;
}): Hotel[] {
  return hotels.filter(
    (h) =>
      h.destinationSlug === destinationSlug &&
      h.category === category &&
      matchesPriceRange(h.pricePerNight, priceRange)
  );
}
