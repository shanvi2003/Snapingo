import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/siteConfig";
import { getAllDestinations } from "@/lib/content/destinations";
import { getAllPackages } from "@/lib/content/packages";
import { getAllServices } from "@/lib/content/services";
import { getAllBlogPosts } from "@/lib/content/blog";

// hotel-results and flight-results are excluded: they are query-param-driven
// search result pages with no canonical content of their own, so they don't
// belong in the sitemap (they're also disallowed in robots.ts).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const now = new Date();
  const [allDestinations, allPackages, services, blogPosts] = await Promise.all([
    getAllDestinations(),
    getAllPackages(),
    getAllServices(),
    getAllBlogPosts(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/destinations`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/packages`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/hot-deals`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/terms-of-service`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy-policy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/cancellation-refund`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const destinationRoutes: MetadataRoute.Sitemap = allDestinations.map((d) => ({
    url: `${base}/destinations/${d.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const packageRoutes: MetadataRoute.Sitemap = allPackages.map((p) => ({
    url: `${base}/packages/${p.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const serviceRoutes: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${base}/services/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((b) => ({
    url: `${base}/blog/${b.id}`,
    lastModified: new Date(b.date),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...destinationRoutes, ...packageRoutes, ...serviceRoutes, ...blogRoutes];
}
