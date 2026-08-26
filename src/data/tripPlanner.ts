// `label` reads as a natural answer to the popup's own question ("Are you
// looking for help in planning your trip?"); `quoteLabel` is the clean noun
// phrase used instead when this choice is echoed back in the WhatsApp quote.
export const tripPurposeOptions = [
  { value: "romantic", label: "Yes! A romantic trip", quoteLabel: "Romantic trip" },
  { value: "family", label: "Yes! For a family trip", quoteLabel: "Family trip" },
  { value: "honeymoon", label: "Yes! A honeymoon trip", quoteLabel: "Honeymoon trip" },
  { value: "friends", label: "Yes! For a trip with my friends", quoteLabel: "Trip with friends" },
  { value: "group", label: "For a group trip", quoteLabel: "Group trip" },
  { value: "solo", label: "For a solo trip", quoteLabel: "Solo trip" },
];

export type DestinationTypeValue =
  | "adventure"
  | "leisure"
  | "beaches"
  | "hill-stations"
  | "nature"
  | "cold-places";

export const destinationTypeOptions: { value: DestinationTypeValue; label: string }[] = [
  { value: "adventure", label: "Adventure" },
  { value: "leisure", label: "Leisure" },
  { value: "beaches", label: "Beaches" },
  { value: "hill-stations", label: "Hill Stations" },
  { value: "nature", label: "Nature" },
  { value: "cold-places", label: "Cold Places" },
];

// Curated slugs from src/data/destinations.ts per vibe, used to suggest
// real Snapingo destinations for the selected destination type.
export const destinationsByType: Record<DestinationTypeValue, string[]> = {
  adventure: ["leh-ladakh", "himachal", "uttarakhand", "north-east", "sikkim-darjeeling"],
  leisure: ["goa", "kerala", "andaman-nicobar", "bali", "thailand"],
  beaches: ["goa", "andaman-nicobar", "lakshadweep", "bali", "maldives", "thailand"],
  "hill-stations": ["himachal", "kashmir", "uttarakhand", "sikkim-darjeeling", "north-east"],
  nature: ["kerala", "north-east", "sikkim-darjeeling", "andaman-nicobar", "bhutan"],
  "cold-places": ["kashmir", "himachal", "leh-ladakh", "sikkim-darjeeling", "bhutan"],
};

export const monthOptions = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const tripDaysOptions = ["2 Days", "3 Days", "4 Days", "5 Days", "6 Days", "7 Days", "8+ Days"];
