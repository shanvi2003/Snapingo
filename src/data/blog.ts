export type BlogContentBlock = {
  heading?: string;
  body: string;
};

export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  readTime: string;
  author: string;
  date: string;
  content: BlogContentBlock[];
};

const img = (id: string) => `/images/unsplash/${id}.jpg`;

export const blogPosts: BlogPost[] = [
  {
    id: "b1",
    title: "10 Hidden Beaches in Goa Only Locals Know About",
    excerpt:
      "Skip the crowds at Baga and Calangute. Here are the quiet stretches of sand worth the extra drive.",
    image: img("1500530855697-b586d89ba3ee"),
    category: "Beach Guide",
    readTime: "6 min read",
    author: "Snapingo Travel Desk",
    date: "2026-06-12",
    content: [
      {
        body: "Baga and Calangute get the crowds, the beach shacks and the jet-ski touts, but Goa's coastline runs for over 100km, and most of it is quieter than the postcards suggest. If you're willing to drive an extra 20-30 minutes off the main strip, here's where the locals actually spend their weekends.",
      },
      {
        heading: "South Goa's Quiet Coves",
        body: "Butterfly Beach near Palolem is only reachable by a short boat ride or a steep forest trail, which keeps the crowds thin. A little further south, Galgibaga (Turtle Beach) is a nesting site for Olive Ridley turtles between November and March. Visit early morning and you'll likely have the sand to yourself.",
      },
      {
        heading: "North Goa, But Further North",
        body: "Past the party stretch of Vagator and Anjuna, Mandrem and Ashwem beaches trade nightlife for beachfront yoga shacks and quieter sunset views. Keep going and Querim (Keri) Beach, right at the Goa-Maharashtra border, is where fishing boats still outnumber tourists.",
      },
      {
        heading: "Getting There",
        body: "Most of these beaches aren't on the main taxi routes, so a rented scooter or a private cab for the day works best. Snapingo's Goa packages can build a day of beach-hopping into your itinerary, just ask your travel expert to add it on.",
      },
    ],
  },
  {
    id: "b2",
    title: "Bali on a Budget: A Realistic 6-Day Itinerary",
    excerpt:
      "How to see temples, rice terraces, and waterfalls in Bali without blowing your travel budget.",
    image: img("1488646953014-85cb44e25828"),
    category: "International",
    readTime: "8 min read",
    author: "Snapingo Travel Desk",
    date: "2026-05-28",
    content: [
      {
        body: "Bali has a reputation for luxury villas and infinity pools, but it's just as easy to see the island on a mid-range budget without cutting corners on the experiences that matter. Here's a realistic 6-day split between Ubud and the south coast.",
      },
      {
        heading: "Days 1-3: Ubud",
        body: "Base yourself in Ubud for the rice terraces, temples and jungle scenery. A homestay or guesthouse here runs a fraction of a Seminyak resort, and you're a short scooter ride from Tegalalang's terraced paddies, the Sacred Monkey Forest, and Tirta Empul's holy spring temple.",
      },
      {
        heading: "Days 4-6: Uluwatu & Seminyak",
        body: "Move south for beach time. Uluwatu's clifftop temple and Kecak dance are worth the evening, and Seminyak's beach clubs are free to enter if you're happy to just order a drink instead of a sunbed package.",
      },
      {
        heading: "What Actually Costs Money",
        body: "Domestic transport (scooter rental or private driver), entrance fees at temples and waterfalls, and food add up faster than accommodation does. Eating at local warungs instead of resort restaurants alone can cut your daily spend by more than half.",
      },
    ],
  },
  {
    id: "b3",
    title: "Best Time to Visit Kashmir for Snow & Shikara Rides",
    excerpt:
      "A month-by-month breakdown of Kashmir's weather so you can plan the trip you actually want.",
    image: img("1541849546-216549ae216d"),
    category: "Travel Tips",
    readTime: "5 min read",
    author: "Snapingo Travel Desk",
    date: "2026-04-15",
    content: [
      {
        body: "Kashmir looks completely different depending on the season, and the trip you want (snow sports vs. houseboats and gardens in bloom) determines when you should actually go.",
      },
      {
        heading: "December – February: Snow Season",
        body: "Gulmarg gets reliable snowfall for skiing and snowboarding, and Srinagar itself can see light snow. Dal Lake sometimes partially freezes. Pack heavy: night temperatures regularly drop below freezing.",
      },
      {
        heading: "March – May: Spring Bloom",
        body: "Srinagar's Mughal gardens, Shalimar Bagh and Nishat Bagh, are at their best as tulips and blossoms come out. Weather is mild and this is a good window for sightseeing without the summer crowds.",
      },
      {
        heading: "June – August: Peak Summer",
        body: "The most popular window, and for good reason: pleasant weather across Srinagar, Gulmarg and Pahalgam. It's also the busiest and priciest time to book, so plan ahead if you're traveling in these months.",
      },
      {
        heading: "September – November: Autumn Colours",
        body: "Chinar trees turn gold and red across Srinagar, and the crowds thin out again. A quieter, photogenic alternative to summer if your dates are flexible.",
      },
    ],
  },
  {
    id: "b4",
    title: "Domestic vs International: How to Actually Decide Your Next Trip",
    excerpt:
      "A simple framework for choosing between a Himachal weekend and a Bali honeymoon based on budget, time and visa hassle.",
    image: img("1502602898657-3e91760cbb34"),
    category: "Travel Tips",
    readTime: "5 min read",
    author: "Snapingo Travel Desk",
    date: "2026-07-02",
    content: [
      {
        body: "Every trip decision eventually comes down to three things: how much time you actually have off, what your budget stretches to, and how much visa/logistics hassle you're willing to deal with.",
      },
      {
        heading: "Under 4 Days Off",
        body: "Stick domestic. Uttarakhand, Goa or Himachal Pradesh are reachable without burning your entire break on transit, and none require visa planning.",
      },
      {
        heading: "5-7 Days Off",
        body: "This is the sweet spot for short-haul international: Bali, Thailand, Dubai and Singapore all fit comfortably, most with visa-on-arrival or e-visa for Indian passport holders.",
      },
      {
        heading: "A Week or More",
        body: "Multi-city trips like Vietnam, or slower long-haul destinations like the Maldives, make more sense when you're not rushing back after 3 days of actual holiday.",
      },
    ],
  },
  {
    id: "b5",
    title: "What's Actually Included in an All-Inclusive Package (And What Isn't)",
    excerpt:
      "Flights, hotels, meals, transfers: here's what to actually check before you assume a package covers everything.",
    image: img("1519681393784-d120267933ba"),
    category: "Travel Tips",
    readTime: "4 min read",
    author: "Snapingo Travel Desk",
    date: "2026-07-20",
    content: [
      {
        body: "\"All-inclusive\" means different things at different agencies. Before you book anywhere, it's worth knowing exactly what to check for.",
      },
      {
        heading: "Usually Included",
        body: "Hotel stay, airport transfers, and a fixed sightseeing itinerary are close to universal in a holiday package. Meals vary: some packages cover breakfast only, others cover breakfast and dinner.",
      },
      {
        heading: "Read the Fine Print On",
        body: "Flights are sometimes a separate line item even in a \"package\", so check whether airfare is bundled or quoted alongside it. Entry tickets for optional activities (scuba diving, theme parks, adventure sports) are almost always extra unless explicitly listed.",
      },
      {
        heading: "Almost Never Included",
        body: "Visa fees, travel insurance, personal shopping and tips are standard exclusions across the industry. Snapingo packages list these clearly on every package page so there's no surprise at checkout.",
      },
    ],
  },
  {
    id: "b6",
    title: "A First-Timer's Guide to Booking a Honeymoon Package",
    excerpt:
      "From choosing between Bali and the Maldives to timing your booking right, everything to know before you plan.",
    image: img("1537996194471-e657df975ab4"),
    category: "International",
    readTime: "7 min read",
    author: "Snapingo Travel Desk",
    date: "2026-07-30",
    content: [
      {
        body: "Honeymoon planning tends to happen in the middle of wedding chaos, which is exactly why a package that bundles the decisions makes sense.",
      },
      {
        heading: "Overwater Villa or Private Pool Villa?",
        body: "The Maldives is the classic pick for overwater villas and total seclusion, at a higher price point. Bali gets you private pool villas, temple culture and a lower cost per day, a good option if you want experiences alongside relaxation.",
      },
      {
        heading: "When to Book",
        body: "Aim to lock your honeymoon package 2-3 months out for peak wedding season (October to February). Resort rooms with the best views sell out first.",
      },
      {
        heading: "What to Ask For",
        body: "Most resorts offer a honeymoon add-on (room decoration, a private dinner, a spa session) if you mention the occasion at booking. Snapingo requests this automatically on every honeymoon package.",
      },
    ],
  },
];

export function getBlogPostById(id: string): BlogPost | undefined {
  return blogPosts.find((p) => p.id === id);
}
