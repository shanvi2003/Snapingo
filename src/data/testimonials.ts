export type Testimonial = {
  id: string;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  trip: string;
  quote: string;
};

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    name: "Ayesha Khan",
    location: "Mumbai",
    avatar: "/images/avatars/women-68.jpg",
    rating: 5,
    trip: "Bali, Indonesia",
    quote:
      "Snapingo planned our entire honeymoon end-to-end: flights, resort upgrades, even a private dinner on the beach. We didn't have to think about a single detail.",
  },
  {
    id: "t2",
    name: "Rohan Mehta",
    location: "Delhi",
    avatar: "/images/avatars/men-32.jpg",
    rating: 5,
    trip: "Kashmir, India",
    quote:
      "The itinerary was perfectly paced and the local guide they arranged in Gulmarg made the trip unforgettable. Best travel money I've spent.",
  },
  {
    id: "t3",
    name: "Priya Nair",
    location: "Bengaluru",
    avatar: "/images/avatars/women-44.jpg",
    rating: 4.5,
    trip: "Dubai, UAE",
    quote:
      "Booked a family package for 6 people and everything (visa, hotel, desert safari) was handled by their team. Genuinely stress-free.",
  },
  {
    id: "t4",
    name: "Karan Kapoor",
    location: "Pune",
    avatar: "/images/avatars/men-76.jpg",
    rating: 5,
    trip: "Kerala, India",
    quote:
      "Loved the houseboat stay in Alleppey they arranged. Support team was reachable on WhatsApp throughout the trip whenever we needed help.",
  },
  {
    id: "t5",
    name: "Simran Kaur",
    location: "Chandigarh",
    avatar: "/images/avatars/women-21.jpg",
    rating: 5,
    trip: "Maldives",
    quote:
      "Our overwater villa looked exactly like the photos. Snapingo's package pricing beat three other agents we compared before booking.",
  },
];
