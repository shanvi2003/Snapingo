import Hero from "@/components/Hero";
import TrustMarquee from "@/components/TrustMarquee";
import Categories from "@/components/Categories";
import Destinations from "@/components/Destinations";
import Packages from "@/components/Packages";
import WhyChooseUs from "@/components/WhyChooseUs";
import Testimonials from "@/components/Testimonials";
import BlogSection from "@/components/BlogSection";

export default function Home() {
  return (
    <>
      <Hero />
      <TrustMarquee />
      <Categories />
      <Destinations />
      <Packages />
      <WhyChooseUs />
      <Testimonials />
      <BlogSection />
    </>
  );
}
