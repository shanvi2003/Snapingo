import Hero from "@/components/Hero";
import TrustMarquee from "@/components/TrustMarquee";
import Categories from "@/components/Categories";
import Destinations from "@/components/Destinations";
import Packages from "@/components/Packages";
import WhyChooseUs from "@/components/WhyChooseUs";
import Testimonials from "@/components/Testimonials";
import BlogSection from "@/components/BlogSection";
import { getAllDestinations } from "@/lib/content/destinations";
import { getFeaturedPackages } from "@/lib/content/packages";
import { getServiceCategories, getTrustLogos, getUsps } from "@/lib/content/homepage";

export default async function Home() {
  const [destinations, featuredPackages, serviceCategories, trustLogos, usps] = await Promise.all([
    getAllDestinations(),
    getFeaturedPackages(),
    getServiceCategories(),
    getTrustLogos(),
    getUsps(),
  ]);

  return (
    <>
      <Hero />
      <TrustMarquee logos={trustLogos} />
      <Categories categories={serviceCategories} />
      <Destinations destinations={destinations} />
      <Packages featuredPackages={featuredPackages} />
      <WhyChooseUs items={usps} />
      <Testimonials />
      <BlogSection />
    </>
  );
}
