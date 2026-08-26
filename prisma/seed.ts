import { config } from "dotenv";
config({ path: ".env.local" });
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
import { allPackages } from "../src/data/packages";
import { domesticDestinations, internationalDestinations } from "../src/data/destinations";
import { services } from "../src/data/services";
import { blogPosts } from "../src/data/blog";
import { faqs } from "../src/data/faq";
import { testimonials } from "../src/data/testimonials";
import { hotels } from "../src/data/hotels";
import { flights } from "../src/data/flights";
import { serviceCategories, trustLogos, usps } from "../src/data/site";
import { inferPackageCategories } from "../src/lib/packageCategoryHelpers";

// Standalone client here (not src/lib/db.ts) since this script runs outside
// the Next.js app via `tsx`, not as a serverless function — no need for the
// globalThis-caching or the tight connection cap that runtime code needs.
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const db = new PrismaClient({ adapter });

async function seedAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME ?? "Admin";
  if (!email || !password) {
    throw new Error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set to seed the bootstrap admin.");
  }
  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await db.staffUser.upsert({
    where: { email },
    update: {},
    create: { name, email, passwordHash, role: "ADMIN" },
  });
  console.log(`Bootstrap admin ready: ${admin.email} (${admin.role})`);
}

async function seedPackages() {
  for (const pkg of allPackages) {
    const categories = inferPackageCategories(pkg);
    await db.package.upsert({
      where: { id: pkg.id },
      update: {},
      create: {
        id: pkg.id,
        title: pkg.title,
        destination: pkg.destination,
        destinationSlug: pkg.destinationSlug,
        type: pkg.type,
        image: pkg.image,
        duration: pkg.duration,
        price: pkg.price,
        originalPrice: pkg.originalPrice,
        rating: pkg.rating,
        reviews: pkg.reviews,
        inclusions: pkg.inclusions,
        exclusions: pkg.exclusions,
        highlights: pkg.highlights,
        badge: pkg.badge,
        featured: pkg.featured,
        hotDeal: pkg.hotDeal ?? false,
        categories,
        itinerary: { create: pkg.itinerary.map((d) => ({ day: d.day, title: d.title, desc: d.desc })) },
      },
    });
  }
  console.log(`Seeded ${allPackages.length} packages`);
}

async function seedDestinations() {
  const all = [...domesticDestinations, ...internationalDestinations];
  for (const d of all) {
    await db.destination.upsert({
      where: { slug: d.slug },
      update: {},
      create: {
        slug: d.slug,
        name: d.name,
        tagline: d.tagline,
        image: d.image,
        gallery: d.gallery,
        packagesCount: d.packages,
        startingPrice: d.startingPrice,
        type: d.type,
        overview: d.overview,
        bestTimeToVisit: d.bestTimeToVisit,
        idealDuration: d.idealDuration,
        highlights: { create: d.highlights.map((h) => ({ icon: h.icon, title: h.title, desc: h.desc })) },
      },
    });
  }
  console.log(`Seeded ${all.length} destinations`);
}

async function seedServices() {
  for (const s of services) {
    await db.service.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        slug: s.slug,
        name: s.name,
        tagline: s.tagline,
        image: s.image,
        overview: s.overview,
        highlights: { create: s.highlights.map((h) => ({ icon: h.icon, title: h.title, desc: h.desc })) },
      },
    });
  }
  console.log(`Seeded ${services.length} services`);
}

async function seedBlog() {
  for (const post of blogPosts) {
    await db.blogPost.upsert({
      where: { id: post.id },
      update: {},
      create: {
        id: post.id,
        title: post.title,
        excerpt: post.excerpt,
        image: post.image,
        category: post.category,
        readTime: post.readTime,
        author: post.author,
        date: new Date(post.date),
        content: {
          create: post.content.map((c, i) => ({ order: i, heading: c.heading, body: c.body })),
        },
      },
    });
  }
  console.log(`Seeded ${blogPosts.length} blog posts`);
}

async function seedFaq() {
  for (let i = 0; i < faqs.length; i++) {
    const category = faqs[i];
    const existing = await db.faqCategory.findUnique({ where: { category: category.category } });
    if (existing) continue;
    await db.faqCategory.create({
      data: {
        category: category.category,
        order: i,
        items: { create: category.items.map((item, j) => ({ order: j, question: item.question, answer: item.answer })) },
      },
    });
  }
  console.log(`Seeded ${faqs.length} FAQ categories`);
}

async function seedTestimonials() {
  for (let i = 0; i < testimonials.length; i++) {
    const t = testimonials[i];
    await db.testimonial.upsert({
      where: { id: t.id },
      update: {},
      create: { id: t.id, name: t.name, location: t.location, avatar: t.avatar, rating: t.rating, trip: t.trip, quote: t.quote, order: i },
    });
  }
  console.log(`Seeded ${testimonials.length} testimonials`);
}

async function seedHotels() {
  for (const h of hotels) {
    await db.hotel.upsert({
      where: { id: h.id },
      update: {},
      create: { id: h.id, name: h.name, destinationSlug: h.destinationSlug, category: h.category, pricePerNight: h.pricePerNight, rating: h.rating },
    });
  }
  console.log(`Seeded ${hotels.length} hotels`);
}

async function seedFlights() {
  for (const f of flights) {
    await db.flight.upsert({
      where: { id: f.id },
      update: {},
      create: {
        id: f.id,
        airline: f.airline,
        departureCitySlug: f.departureCitySlug,
        destinationSlug: f.destinationSlug,
        flightClass: f.flightClass,
        price: f.price,
        duration: f.duration,
      },
    });
  }
  console.log(`Seeded ${flights.length} flights`);
}

// These 3 have no natural unique key in the static source data (just a
// position in an array), so re-running the seed can't upsert by key like
// the rest of this file does. Guard on "table is empty" instead - seeds
// once, then leaves whatever the admin panel has saved alone forever after.
async function seedServiceCategories() {
  if ((await db.serviceCategory.count()) > 0) return;
  await db.serviceCategory.createMany({
    data: serviceCategories.map((c, i) => ({ icon: c.icon, label: c.label, desc: c.desc, image: c.image, order: i })),
  });
  console.log(`Seeded ${serviceCategories.length} service categories`);
}

async function seedTrustLogos() {
  if ((await db.trustLogo.count()) > 0) return;
  await db.trustLogo.createMany({
    data: trustLogos.map((t, i) => ({ name: t.name, category: t.category, logo: t.logo, order: i })),
  });
  console.log(`Seeded ${trustLogos.length} trust logos`);
}

async function seedUsps() {
  if ((await db.usp.count()) > 0) return;
  await db.usp.createMany({
    data: usps.map((u, i) => ({ icon: u.icon, title: u.title, desc: u.desc, order: i })),
  });
  console.log(`Seeded ${usps.length} USPs`);
}

async function main() {
  await seedAdmin();
  await seedPackages();
  await seedDestinations();
  await seedServices();
  await seedBlog();
  await seedFaq();
  await seedTestimonials();
  await seedHotels();
  await seedFlights();
  await seedServiceCategories();
  await seedTrustLogos();
  await seedUsps();
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
