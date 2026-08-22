export type DestinationHighlight = {
  icon: string;
  title: string;
  desc: string;
};

export type Destination = {
  slug: string;
  name: string;
  tagline: string;
  image: string;
  gallery: string[];
  packages: number;
  startingPrice: number;
  type: "domestic" | "international";
  overview: string;
  highlights: DestinationHighlight[];
  bestTimeToVisit: string;
  idealDuration: string;
};

const img = (id: string, w = 1920, h?: number) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ""}&q=90`;

const gallery = (id: string, borrowedId: string) => [
  img(id, 1400, 900),
  img(id, 900, 1100),
  img(borrowedId, 1000, 750),
  img(id, 1000, 1000),
];

export const domesticDestinations: Destination[] = [
  {
    slug: "himachal",
    name: "Himachal Pradesh",
    tagline: "Snow peaks & hill towns",
    image: img("1626621341517-bbf3d9990a23"),
    gallery: gallery("1626621341517-bbf3d9990a23", "1593118845043-359e5f628214"),
    packages: 168,
    startingPrice: 7999,
    type: "domestic",
    overview:
      "From Manali's snow-line and Solang Valley to Shimla's colonial mall road and the quieter monasteries of Spiti, Himachal Pradesh strings together the Himalayas' most accessible hill stations into one easy circuit.",
    highlights: [
      { icon: "Mountain", title: "Rohtang Pass, Manali", desc: "High-altitude snow point with valley views (seasonal permits apply)." },
      { icon: "Sun", title: "Solang Valley", desc: "Paragliding, zorbing and cable car rides over the valley floor." },
      { icon: "Landmark", title: "Shimla Mall Road", desc: "Colonial-era promenade, Christ Church and the toy train up from Kalka." },
      { icon: "Camera", title: "Old Manali & Kasol Cafes", desc: "Riverside cafes threaded through pine forest and backpacker lanes." },
    ],
    bestTimeToVisit: "October – February (snow), March – June (valleys)",
    idealDuration: "5–6 days",
  },
  {
    slug: "kashmir",
    name: "Kashmir",
    tagline: "Paradise on earth",
    image: img("1595815771614-ade9d652a65d"),
    gallery: gallery("1595815771614-ade9d652a65d", "1626621341517-bbf3d9990a23"),
    packages: 87,
    startingPrice: 15999,
    type: "domestic",
    overview:
      "A night on a houseboat on Dal Lake, the gondola ride up Gulmarg's Apharwat peak, and Pahalgam's Betaab Valley: Kashmir moves from Mughal gardens to snowline in the space of a single itinerary.",
    highlights: [
      { icon: "Sailboat", title: "Dal Lake & Shikara", desc: "Houseboat stays and sunrise shikara rides past floating gardens." },
      { icon: "Mountain", title: "Gulmarg Gondola", desc: "Asia's highest cable car up to Apharwat Peak for skiing or snow views." },
      { icon: "TreePine", title: "Pahalgam & Betaab Valley", desc: "Pine forests, river banks and the valley made famous on film." },
      { icon: "Landmark", title: "Mughal Gardens, Srinagar", desc: "Terraced gardens, Shalimar Bagh and Nishat Bagh, built by the Mughals." },
    ],
    bestTimeToVisit: "April – October (spring/summer), Dec – Feb (snow)",
    idealDuration: "6 days",
  },
  {
    slug: "uttarakhand",
    name: "Uttarakhand",
    tagline: "Ganga ghats & Himalayan trails",
    image: img("1719581827279-e9a8d8fce924"),
    gallery: gallery("1719581827279-e9a8d8fce924", "1595815771614-ade9d652a65d"),
    packages: 94,
    startingPrice: 6999,
    type: "domestic",
    overview:
      "White-water rapids and the Ganga Aarti at Rishikesh, Nainital's mirror-still lake, and Mussoorie's ridge-top views: Uttarakhand pairs the yoga capital of the world with some of North India's favourite hill stations.",
    highlights: [
      { icon: "Sailboat", title: "White Water Rafting, Rishikesh", desc: "Grade I–IV rapids on the Ganga, from Shivpuri down to Rishikesh." },
      { icon: "Flame", title: "Ganga Aarti, Triveni Ghat", desc: "Evening prayer ceremony with lamps set afloat on the river." },
      { icon: "Mountain", title: "Nainital & Mussoorie", desc: "Lake-side promenades and ridge-top viewpoints over the Doon valley." },
      { icon: "Sparkles", title: "Yoga & Meditation Ashrams", desc: "Drop-in classes and multi-day retreats along the riverbank." },
    ],
    bestTimeToVisit: "September – November, February – April",
    idealDuration: "5 days",
  },
  {
    slug: "andaman-nicobar",
    name: "Andaman & Nicobar",
    tagline: "Turquoise island escape",
    image: img("1589979481223-deb893043163"),
    gallery: gallery("1589979481223-deb893043163", "1572431447238-425af66a273b"),
    packages: 64,
    startingPrice: 17999,
    type: "domestic",
    overview:
      "Radhanagar Beach on Havelock regularly tops Asia's best-beach lists, and the reefs off Neil Island make for some of India's clearest scuba diving, with Port Blair's colonial history as a quieter counterpoint.",
    highlights: [
      { icon: "Waves", title: "Radhanagar Beach, Havelock", desc: "White sand and turquoise water, best at sunset." },
      { icon: "Sailboat", title: "Scuba Diving, Neil Island", desc: "Coral reef dives suited to first-timers and certified divers alike." },
      { icon: "Landmark", title: "Cellular Jail, Port Blair", desc: "Colonial-era prison with an evening light-and-sound show." },
      { icon: "Camera", title: "Ross Island", desc: "Ruined British-era buildings reclaimed by forest, reachable by boat." },
    ],
    bestTimeToVisit: "October – May",
    idealDuration: "5 days",
  },
  {
    slug: "kerala",
    name: "Kerala",
    tagline: "God's own backwaters",
    image: img("1602216056096-3b40cc0c9944"),
    gallery: gallery("1602216056096-3b40cc0c9944", "1512343879784-a960bf40e7f2"),
    packages: 96,
    startingPrice: 12499,
    type: "domestic",
    overview:
      "A private houseboat drifting through Alleppey's backwaters, misty tea estates in Munnar, and a Kathakali performance at dusk: Kerala pairs slow travel with genuine variety across three very different landscapes.",
    highlights: [
      { icon: "Sailboat", title: "Alleppey Houseboat", desc: "Overnight stay on a converted rice barge through palm-lined canals." },
      { icon: "Mountain", title: "Munnar Tea Gardens", desc: "Rolling tea estates, viewpoints and cool hill-station mornings." },
      { icon: "Music", title: "Kathakali & Ayurveda", desc: "Traditional dance performances and authentic Ayurvedic spa treatments." },
      { icon: "TreePine", title: "Periyar Wildlife Safari", desc: "Boat and jeep safaris through Thekkady's tiger reserve." },
    ],
    bestTimeToVisit: "September – March",
    idealDuration: "5–6 days",
  },
  {
    slug: "rajasthan",
    name: "Rajasthan",
    tagline: "Forts, palaces & desert",
    image: img("1695395550316-8995ae9d35ff"),
    gallery: gallery("1695395550316-8995ae9d35ff", "1606298855672-3efb63017be8"),
    packages: 143,
    startingPrice: 10999,
    type: "domestic",
    overview:
      "From Amber Fort's hilltop ramparts in Jaipur to Jaisalmer's golden desert dunes and Udaipur's lake palaces, this multi-city route covers the full range of Rajputana history in one royal circuit.",
    highlights: [
      { icon: "Landmark", title: "Amber Fort, Jaipur", desc: "Hilltop fort with mirrored halls, reached by jeep or elephant." },
      { icon: "Landmark", title: "Mehrangarh Fort, Jodhpur", desc: "Sun-baked ramparts overlooking Jodhpur's blue old city." },
      { icon: "Tent", title: "Jaisalmer Desert Safari", desc: "Camel rides and overnight camping in the Thar Desert dunes." },
      { icon: "Building2", title: "Udaipur Lake Palaces", desc: "Boat rides on Lake Pichola past the City Palace and Lake Palace hotel." },
    ],
    bestTimeToVisit: "October – March",
    idealDuration: "7 days",
  },
  {
    slug: "uttar-pradesh",
    name: "Uttar Pradesh",
    tagline: "Taj Mahal & temple ghats",
    image: img("1564507592333-c60657eea523"),
    gallery: gallery("1564507592333-c60657eea523", "1587474260584-136574528ed5"),
    packages: 78,
    startingPrice: 8499,
    type: "domestic",
    overview:
      "The Taj Mahal at sunrise, Varanasi's ancient ghats lit by evening aarti, and Lucknow's Nawabi kitchens: Uttar Pradesh is where most first-time India itineraries begin, and rarely disappoints.",
    highlights: [
      { icon: "Landmark", title: "Taj Mahal, Agra", desc: "Best seen at sunrise, before the coaches and the midday heat arrive." },
      { icon: "Flame", title: "Ganga Aarti, Varanasi", desc: "Evening prayer ceremony on the ghats, one of India's oldest living cities." },
      { icon: "Landmark", title: "Agra Fort", desc: "Red-sandstone Mughal fort overlooking the Yamuna, a short drive from the Taj." },
      { icon: "Utensils", title: "Lucknow's Nawabi Cuisine", desc: "Kebabs, biryani and Awadhi cooking in the City of Nawabs." },
    ],
    bestTimeToVisit: "October – March",
    idealDuration: "4–5 days",
  },
  {
    slug: "madhya-pradesh",
    name: "Madhya Pradesh",
    tagline: "Temples & tiger reserves",
    image: img("1606298855672-3efb63017be8"),
    gallery: gallery("1606298855672-3efb63017be8", "1695395550316-8995ae9d35ff"),
    packages: 51,
    startingPrice: 9499,
    type: "domestic",
    overview:
      "The intricately carved temples of Khajuraho, tiger safaris through Kanha and Bandhavgarh, and Gwalior's hilltop fort put Madhya Pradesh at the centre of India, both geographically and historically.",
    highlights: [
      { icon: "Landmark", title: "Khajuraho Temples", desc: "UNESCO-listed temple complex famed for its intricate stone carving." },
      { icon: "TreePine", title: "Kanha & Bandhavgarh Safaris", desc: "Two of India's best-known tiger reserves, best visited at dawn." },
      { icon: "Building2", title: "Gwalior Fort", desc: "Hilltop fortress with palaces spanning several centuries of dynasties." },
      { icon: "Landmark", title: "Sanchi Stupa", desc: "One of the oldest Buddhist monuments in India, near Bhopal." },
    ],
    bestTimeToVisit: "October – March",
    idealDuration: "5 days",
  },
  {
    slug: "leh-ladakh",
    name: "Leh Ladakh",
    tagline: "High-altitude adventure",
    image: img("1600356033695-a003690a6351"),
    gallery: gallery("1600356033695-a003690a6351", "1626621341517-bbf3d9990a23"),
    packages: 59,
    startingPrice: 18999,
    type: "domestic",
    overview:
      "Pangong Lake's shifting blues, camel rides on Nubra Valley's sand dunes, and monasteries perched above Leh: Ladakh trades in scale, best covered over a slower, altitude-adjusted itinerary.",
    highlights: [
      { icon: "Mountain", title: "Pangong Lake", desc: "High-altitude lake stretching into Tibet, colour-shifting through the day." },
      { icon: "Compass", title: "Nubra Valley", desc: "Double-humped camel rides across cold desert sand dunes." },
      { icon: "Landmark", title: "Khardung La Pass", desc: "One of the world's highest motorable passes, en route to Nubra." },
      { icon: "Sparkles", title: "Thiksey & Hemis Monasteries", desc: "Cliffside monasteries with morning prayer chants and mountain views." },
    ],
    bestTimeToVisit: "May – September",
    idealDuration: "6–7 days",
  },
  {
    slug: "north-east",
    name: "North East",
    tagline: "Meghalaya, Assam, Arunachal & beyond",
    image: img("1742494267580-e026d3737f65"),
    gallery: gallery("1742494267580-e026d3737f65", "1602216056096-3b40cc0c9944"),
    packages: 75,
    startingPrice: 14999,
    type: "domestic",
    overview:
      "Cherrapunji's living root bridges, Kaziranga's rhino safaris in Assam, Tawang's monastery in Arunachal Pradesh, and the hill culture of Manipur, Mizoram and Tripura make the North East India's least-crowded region for genuinely different landscapes, easily combined across states on a single circuit.",
    highlights: [
      { icon: "TreePine", title: "Living Root Bridges, Meghalaya", desc: "Bridges grown from rubber tree roots over generations, near Cherrapunji." },
      { icon: "Compass", title: "Kaziranga National Park, Assam", desc: "Jeep and elephant safaris in search of the one-horned rhinoceros." },
      { icon: "Mountain", title: "Tawang Monastery, Arunachal", desc: "India's largest monastery, set high in the eastern Himalayas." },
      { icon: "Landmark", title: "Loktak Lake & Ziro Valley", desc: "Manipur's floating islands and Arunachal's terraced Apatani valley." },
    ],
    bestTimeToVisit: "September – May",
    idealDuration: "6–7 days",
  },
  {
    slug: "goa",
    name: "Goa",
    tagline: "Beaches, shacks & sunsets",
    image: img("1512343879784-a960bf40e7f2"),
    gallery: gallery("1512343879784-a960bf40e7f2", "1579796251487-dd313f51de4a"),
    packages: 128,
    startingPrice: 8999,
    type: "domestic",
    overview:
      "North Goa's beach shacks and flea markets sit an hour from South Goa's quieter coves and Portuguese-era villas. Expect a mix of sunset parties in Baga, colonial architecture in Fontainhas, and slow mornings on Palolem's sand.",
    highlights: [
      { icon: "Waves", title: "Baga & Calangute", desc: "Beach shacks, water sports and Goa's liveliest nightlife strip." },
      { icon: "Landmark", title: "Fontainhas & Fort Aguada", desc: "Portuguese-era lanes, a 17th-century fort and sea-facing lighthouse views." },
      { icon: "ShoppingBag", title: "Anjuna Flea Market", desc: "Wednesday market with local crafts, live music and sunset cafes." },
      { icon: "Sailboat", title: "Palolem Water Sports", desc: "Kayaking, dolphin-spotting boat rides and calmer South Goa coves." },
    ],
    bestTimeToVisit: "November – February",
    idealDuration: "4–5 days",
  },
  {
    slug: "daman-diu",
    name: "Daman & Diu",
    tagline: "Portuguese forts & quiet coasts",
    image: img("1620052202143-ef7773d49a3a"),
    gallery: gallery("1620052202143-ef7773d49a3a", "1512343879784-a960bf40e7f2"),
    packages: 21,
    startingPrice: 6999,
    type: "domestic",
    overview:
      "Diu's 16th-century Portuguese fort looks out over an uncrowded coastline, while Daman's churches and promenade make for an easy, laid-back weekend away from the bigger Goa crowds.",
    highlights: [
      { icon: "Landmark", title: "Diu Fort", desc: "16th-century Portuguese fort with sea-facing ramparts and a lighthouse." },
      { icon: "Waves", title: "Nagoa & Jampore Beaches", desc: "Quiet, uncrowded stretches of sand on Daman and Diu's coastline." },
      { icon: "Building2", title: "Portuguese Churches", desc: "Colonial-era chapels and whitewashed facades across old Diu town." },
      { icon: "Camera", title: "Diu Island Drive", desc: "A compact coastal loop past cliffs, coves and fishing villages." },
    ],
    bestTimeToVisit: "October – March",
    idealDuration: "2–3 days",
  },
  {
    slug: "delhi",
    name: "Delhi",
    tagline: "Mughal monuments & markets",
    image: img("1587474260584-136574528ed5"),
    gallery: gallery("1587474260584-136574528ed5", "1564507592333-c60657eea523"),
    packages: 62,
    startingPrice: 5499,
    type: "domestic",
    overview:
      "India Gate lit up at dusk, the Red Fort's Mughal ramparts, and Chandni Chowk's street food lanes sit a short drive from Lutyens' colonial-era boulevards, making Delhi one of the easiest cities in India to cover in a long weekend.",
    highlights: [
      { icon: "Landmark", title: "India Gate & Rajpath", desc: "War memorial and ceremonial boulevard, best seen lit up after dark." },
      { icon: "Building2", title: "Red Fort & Jama Masjid", desc: "Mughal-era fort and India's largest mosque, both in Old Delhi." },
      { icon: "Utensils", title: "Chandni Chowk Food Walk", desc: "Parathas, chaat and centuries-old sweet shops in the old city lanes." },
      { icon: "Landmark", title: "Qutub Minar & Humayun's Tomb", desc: "Two UNESCO World Heritage sites, both within the city limits." },
    ],
    bestTimeToVisit: "October – March",
    idealDuration: "3 days",
  },
  {
    slug: "odisha",
    name: "Odisha",
    tagline: "Sun temples & sea beaches",
    image: img("1601815264039-67c8ba1a7f98"),
    gallery: gallery("1601815264039-67c8ba1a7f98", "1656311882834-e5e7909f5fcf"),
    packages: 34,
    startingPrice: 8999,
    type: "domestic",
    overview:
      "The chariot-shaped Sun Temple at Konark, Puri's Jagannath Temple and beach, and Chilika Lake's migratory birds make Odisha an underrated stretch of India's east coast, rich in temple architecture and coastline alike.",
    highlights: [
      { icon: "Landmark", title: "Konark Sun Temple", desc: "13th-century chariot-shaped temple, a UNESCO World Heritage Site." },
      { icon: "Waves", title: "Puri Beach & Jagannath Temple", desc: "One of India's four sacred Char Dham pilgrimage sites, by the sea." },
      { icon: "Bird", title: "Chilika Lake", desc: "Asia's largest brackish water lagoon, home to migratory flamingos." },
      { icon: "ShoppingBag", title: "Pattachitra Art Villages", desc: "Traditional scroll-painting workshops around Raghurajpur." },
    ],
    bestTimeToVisit: "October – February",
    idealDuration: "4–5 days",
  },
  {
    slug: "nagaland",
    name: "Nagaland",
    tagline: "Hornbill Festival & tribal hills",
    image: img("1585816738218-1d34c7ab4e23"),
    gallery: gallery("1585816738218-1d34c7ab4e23", "1742494267580-e026d3737f65"),
    packages: 18,
    startingPrice: 13999,
    type: "domestic",
    overview:
      "The Hornbill Festival in Kohima brings together all of Nagaland's tribes for a week of dance, food and music each December, while the rest of the year the state's green hills and Konyak villages stay wonderfully quiet.",
    highlights: [
      { icon: "Music", title: "Hornbill Festival, Kohima", desc: "A week-long celebration of Naga tribal culture, dance and cuisine each December." },
      { icon: "TreePine", title: "Dzukou Valley Trek", desc: "A multi-day trek through rolling hills famous for seasonal wildflowers." },
      { icon: "Landmark", title: "Kohima War Cemetery", desc: "A moving WWII memorial set on a hillside above the city." },
      { icon: "Compass", title: "Mon District Villages", desc: "Konyak tribal villages, once known for their headhunting history." },
    ],
    bestTimeToVisit: "November – April (Hornbill Festival in December)",
    idealDuration: "5 days",
  },
  {
    slug: "chandigarh",
    name: "Chandigarh",
    tagline: "Planned city & Rock Garden",
    image: img("1588669494151-f4c6df6f715b"),
    gallery: gallery("1588669494151-f4c6df6f715b", "1587474260584-136574528ed5"),
    packages: 16,
    startingPrice: 4999,
    type: "domestic",
    overview:
      "Le Corbusier's modernist grid, the found-object sculptures of the Rock Garden, and boating on Sukhna Lake make India's first planned city an easy, laid-back short break, often paired with a trip into the Himachal foothills.",
    highlights: [
      { icon: "Landmark", title: "Nek Chand Rock Garden", desc: "A sprawling sculpture garden built entirely from recycled industrial waste." },
      { icon: "Waves", title: "Sukhna Lake", desc: "A man-made lake with a promenade, ideal for an evening boat ride." },
      { icon: "Building2", title: "Capitol Complex", desc: "Le Corbusier's UNESCO-listed government buildings and open hand monument." },
      { icon: "ShoppingBag", title: "Sector 17 Plaza", desc: "The city's original modernist shopping and dining plaza." },
    ],
    bestTimeToVisit: "October – March",
    idealDuration: "2 days",
  },
  {
    slug: "lakshadweep",
    name: "Lakshadweep",
    tagline: "Coral atolls & lagoons",
    image: img("1572431447238-425af66a273b"),
    gallery: gallery("1572431447238-425af66a273b", "1589979481223-deb893043163"),
    packages: 14,
    startingPrice: 24999,
    type: "domestic",
    overview:
      "A cluster of coral atolls off the Kerala coast, Lakshadweep's lagoons run from pale turquoise to deep blue within a few strokes, with permit-only access keeping the islands some of the least-visited in India.",
    highlights: [
      { icon: "Waves", title: "Agatti & Bangaram Lagoons", desc: "Glass-clear turquoise lagoons ringed by coral reef and white sand." },
      { icon: "Sailboat", title: "Scuba Diving & Snorkelling", desc: "Some of India's healthiest coral reefs, with visibility up to 30 metres." },
      { icon: "Sun", title: "Kavaratti Island", desc: "The union territory's capital, with its own quiet lagoon and mosques." },
      { icon: "Compass", title: "Island-Hopping by Boat", desc: "Inter-island ferries and speedboats between the inhabited atolls." },
    ],
    bestTimeToVisit: "October – May",
    idealDuration: "4–5 days",
  },
  {
    slug: "andhra-pradesh",
    name: "Andhra Pradesh",
    tagline: "Temples, valleys & coastline",
    image: img("1707833685224-9fcce62dcd3c"),
    gallery: gallery("1707833685224-9fcce62dcd3c", "1601815264039-67c8ba1a7f98"),
    packages: 29,
    startingPrice: 8499,
    type: "domestic",
    overview:
      "Tirupati's hilltop temple draws millions of pilgrims a year, while Araku Valley's coffee estates and Visakhapatnam's beaches show a quieter, greener side of Andhra Pradesh along the Eastern Ghats and coastline.",
    highlights: [
      { icon: "Landmark", title: "Tirumala Venkateswara Temple", desc: "One of the world's most visited pilgrimage sites, above Tirupati." },
      { icon: "Mountain", title: "Araku Valley", desc: "Coffee plantations and waterfalls in the Eastern Ghats, reached by a scenic train." },
      { icon: "Waves", title: "Visakhapatnam Beaches", desc: "RK Beach promenade and a submarine museum along the port city's coast." },
      { icon: "TreePine", title: "Borra Caves", desc: "Million-year-old limestone caves with dramatic stalactite formations." },
    ],
    bestTimeToVisit: "October – March",
    idealDuration: "4 days",
  },
  {
    slug: "sikkim-darjeeling",
    name: "Sikkim & Darjeeling",
    tagline: "Kanchenjunga views & tea estates",
    image: img("1668350202638-046c51e1d4de"),
    gallery: gallery("1668350202638-046c51e1d4de", "1742494267580-e026d3737f65"),
    packages: 31,
    startingPrice: 18000,
    type: "domestic",
    overview:
      "Sunrise over Kanchenjunga from Tiger Hill, a turquoise Tsomgo Lake near the Indo-China border, and Gangtok's ropeway views over a hillside capital: Sikkim and Darjeeling pair Himalayan viewpoints with some of India's best-known tea estates, all on a single hill circuit.",
    highlights: [
      { icon: "Sun", title: "Tiger Hill Sunrise, Darjeeling", desc: "A pre-dawn drive for sunrise views over Kanchenjunga, the world's third-highest peak." },
      { icon: "Mountain", title: "Tsomgo Lake & Baba Mandir", desc: "A glacial lake at 12,400 ft near the Indo-China border, reached via a scenic drive from Gangtok." },
      { icon: "TreePine", title: "Darjeeling Tea Gardens", desc: "Rolling tea estates around the hill town, with valley views and a working toy train." },
      { icon: "Compass", title: "Gangtok Ropeway & MG Marg", desc: "A cable car over the capital, plus its pedestrian-only, cafe-lined main promenade." },
    ],
    bestTimeToVisit: "March – May, October – December",
    idealDuration: "6–7 days",
  },
];

export const internationalDestinations: Destination[] = [
  {
    slug: "bali",
    name: "Bali",
    tagline: "Temples & rice terraces",
    image: img("1537996194471-e657df975ab4"),
    gallery: gallery("1537996194471-e657df975ab4", "1552465011-b4e21bf6e79a"),
    packages: 112,
    startingPrice: 34999,
    type: "international",
    overview:
      "Sunset at Uluwatu's clifftop temple, Ubud's terraced rice fields and monkey forest, and Seminyak's beach clubs: Bali packs temple culture, jungle calm and coastline into a compact, easy-to-combine island.",
    highlights: [
      { icon: "Landmark", title: "Uluwatu Temple", desc: "Clifftop sea temple with an evening Kecak fire dance." },
      { icon: "TreePine", title: "Tegalalang Rice Terraces", desc: "Tiered green paddies near Ubud, best visited early morning." },
      { icon: "Sparkles", title: "Ubud Monkey Forest & Yoga", desc: "Sacred forest sanctuary alongside Bali's wellness retreat scene." },
      { icon: "Waves", title: "Seminyak Beach Clubs", desc: "Sunset beach clubs and surf-friendly stretches of coastline." },
    ],
    bestTimeToVisit: "April – October",
    idealDuration: "6 days",
  },
  {
    slug: "dubai",
    name: "Dubai",
    tagline: "Desert luxury & skylines",
    image: img("1512453979798-5ea266f8880c"),
    gallery: gallery("1512453979798-5ea266f8880c", "1525625293386-3f8f99389edd"),
    packages: 134,
    startingPrice: 29999,
    type: "international",
    overview:
      "The Burj Khalifa's observation deck by day, dune bashing in the Arabian desert by evening: Dubai stacks record-setting architecture against a genuinely old souk and desert culture just outside the city limits.",
    highlights: [
      { icon: "Building2", title: "Burj Khalifa", desc: "World's tallest building, with an At the Top observation deck." },
      { icon: "Sun", title: "Desert Safari", desc: "Dune bashing, camel rides and a BBQ dinner under the stars." },
      { icon: "ShoppingBag", title: "Dubai Mall & Fountain", desc: "Retail, aquarium and the Dubai Fountain show on Burj Lake." },
      { icon: "Waves", title: "Palm Jumeirah", desc: "Man-made archipelago lined with resorts and beach clubs." },
    ],
    bestTimeToVisit: "November – March",
    idealDuration: "5 days",
  },
  {
    slug: "maldives",
    name: "Maldives",
    tagline: "Overwater villas",
    image: img("1573843981267-be1999ff37cd"),
    gallery: gallery("1573843981267-be1999ff37cd", "1552465011-b4e21bf6e79a"),
    packages: 45,
    startingPrice: 54999,
    type: "international",
    overview:
      "An overwater villa with a private plunge pool, house-reef snorkeling a few steps from your deck, and a sunset dolphin cruise: the Maldives is built for slow, all-inclusive resort time rather than a packed itinerary.",
    highlights: [
      { icon: "Building2", title: "Overwater Villas", desc: "Private decks and glass floor panels over the lagoon." },
      { icon: "Sailboat", title: "House Reef Snorkeling", desc: "Coral reefs accessible directly from most resort jetties." },
      { icon: "Waves", title: "Sunset Dolphin Cruise", desc: "Evening boat rides to spot spinner dolphins offshore." },
      { icon: "Sun", title: "Private Sandbank Picnic", desc: "A secluded sandbank set up for a couple or small group." },
    ],
    bestTimeToVisit: "November – April",
    idealDuration: "4 days",
  },
  {
    slug: "vietnam",
    name: "Vietnam",
    tagline: "Bays, caves & culture",
    image: img("1528127269322-539801943592"),
    gallery: gallery("1528127269322-539801943592", "1537996194471-e657df975ab4"),
    packages: 41,
    startingPrice: 36999,
    type: "international",
    overview:
      "An overnight cruise through Ha Long Bay's limestone karsts, lantern-lit evenings in Hoi An's old town, the Cu Chi tunnel network outside Ho Chi Minh City, and Sapa's terraced rice fields: Vietnam spans coast, history and highlands.",
    highlights: [
      { icon: "Sailboat", title: "Ha Long Bay Cruise", desc: "Overnight boat cruise past thousands of limestone karst islands." },
      { icon: "Camera", title: "Hoi An Old Town", desc: "Lantern-lit riverside streets and tailor shops after dark." },
      { icon: "Compass", title: "Cu Chi Tunnels", desc: "Wartime tunnel network outside Ho Chi Minh City, open to visitors." },
      { icon: "TreePine", title: "Sapa Rice Terraces", desc: "Terraced hillsides and trekking routes through highland villages." },
    ],
    bestTimeToVisit: "September – December, March – April",
    idealDuration: "7 days",
  },
  {
    slug: "malaysia",
    name: "Malaysia",
    tagline: "Towers, islands & street food",
    image: img("1597148543182-830ef7bbb904"),
    gallery: gallery("1597148543182-830ef7bbb904", "1525625293386-3f8f99389edd"),
    packages: 38,
    startingPrice: 27999,
    type: "international",
    overview:
      "Kuala Lumpur's Petronas Towers lit up after dark, Langkawi's cable car over the rainforest canopy, and Penang's street food lanes give Malaysia a genuinely varied short-haul itinerary, from skyline to island in a single trip.",
    highlights: [
      { icon: "Building2", title: "Petronas Twin Towers, KL", desc: "Sky Bridge and observation deck views over Kuala Lumpur's skyline." },
      { icon: "Waves", title: "Langkawi Islands", desc: "Cable car over the rainforest, duty-free shopping and quiet beaches." },
      { icon: "Utensils", title: "Penang Street Food", desc: "Georgetown's hawker stalls and UNESCO-listed colonial old town." },
      { icon: "TreePine", title: "Cameron Highlands", desc: "Tea plantations and cool-climate hill station north of KL." },
    ],
    bestTimeToVisit: "December – February",
    idealDuration: "6 days",
  },
  {
    slug: "thailand",
    name: "Thailand",
    tagline: "Islands & street food",
    image: img("1552465011-b4e21bf6e79a"),
    gallery: gallery("1552465011-b4e21bf6e79a", "1537996194471-e657df975ab4"),
    packages: 98,
    startingPrice: 27999,
    type: "international",
    overview:
      "Longtail boats through the Phi Phi Islands, Phuket's beaches, Bangkok's street food stalls after dark, and limestone cliffs at Railay near Krabi: Thailand covers island-hopping and city energy in one trip.",
    highlights: [
      { icon: "Sailboat", title: "Phi Phi Islands", desc: "Longtail boat tours to Maya Bay and surrounding limestone islands." },
      { icon: "Waves", title: "Phuket Beaches", desc: "Patong, Kata and Karon beaches with a lively nightlife strip." },
      { icon: "Utensils", title: "Bangkok Street Food", desc: "Night markets and street stalls across Chinatown and Sukhumvit." },
      { icon: "Mountain", title: "Krabi Rock Climbing", desc: "Limestone cliffs at Railay Beach, suited to beginners and experts." },
    ],
    bestTimeToVisit: "November – February",
    idealDuration: "6 days",
  },
  {
    slug: "singapore",
    name: "Singapore",
    tagline: "Future-forward cityscape",
    image: img("1525625293386-3f8f99389edd"),
    gallery: gallery("1525625293386-3f8f99389edd", "1512453979798-5ea266f8880c"),
    packages: 76,
    startingPrice: 39999,
    type: "international",
    overview:
      "Supertrees light up after dark at Gardens by the Bay, Sentosa's beaches and theme parks fill the day, and Marina Bay Sands anchors a compact, walkable skyline. Singapore works well as a short, high-density stopover or standalone trip.",
    highlights: [
      { icon: "Sparkles", title: "Gardens by the Bay", desc: "Supertree Grove light show and the Cloud Forest dome." },
      { icon: "Waves", title: "Sentosa Island", desc: "Beaches, cable cars and Universal Studios Singapore." },
      { icon: "Building2", title: "Marina Bay Sands", desc: "Infinity pool skyline views and the Marina Bay light show." },
      { icon: "Camera", title: "Universal Studios", desc: "Themed rides across Hollywood, Sci-Fi City and Ancient Egypt zones." },
    ],
    bestTimeToVisit: "February – April",
    idealDuration: "4–5 days",
  },
  {
    slug: "bhutan",
    name: "Bhutan",
    tagline: "Kingdom of the Thunder Dragon",
    image: img("1743402063949-ad3c824c2484"),
    gallery: gallery("1743402063949-ad3c824c2484", "1626621341517-bbf3d9990a23"),
    packages: 30,
    startingPrice: 24800,
    type: "international",
    overview:
      "Taktsang Monastery clinging to a cliff above Paro, Punakha Dzong at the confluence of two rivers, and Thimphu's giant Buddha Dordenma watching over the valley: Bhutan pairs untouched Himalayan scenery with a culture that has stayed carefully, deliberately intact.",
    highlights: [
      { icon: "Landmark", title: "Taktsang Monastery, Paro", desc: "The Tiger's Nest clings to a cliff 900 metres above the valley floor, reached by a moderate hike." },
      { icon: "Building2", title: "Punakha Dzong", desc: "Bhutan's most beautiful fortress, built in 1637 at the meeting point of the Pho Chu and Mo Chu rivers." },
      { icon: "Mountain", title: "Dochu La Pass", desc: "108 chortens and, on a clear day, a full panorama of the snow-capped eastern Himalayas." },
      { icon: "Sparkles", title: "Buddha Dordenma & Thimphu", desc: "A giant hilltop Buddha statue overlooking Bhutan's capital, alongside its Memorial Chorten and weekend market." },
    ],
    bestTimeToVisit: "March – May, September – November",
    idealDuration: "5–7 days",
  },
];

export const allDestinations: Destination[] = [
  ...domesticDestinations,
  ...internationalDestinations,
];

export function getDestinationBySlug(slug: string): Destination | undefined {
  return allDestinations.find((d) => d.slug === slug);
}
