import type { Metadata } from "next";
import BlogGrid from "@/components/BlogGrid";

export const metadata: Metadata = {
  title: "Travel Stories & Guides | Snapingo",
  description:
    "Guides, itineraries and tips from the Snapingo travel desk, for your next domestic or international trip.",
};

export default function BlogListingPage() {
  return (
    <>
      <section className="bg-ink-50/60 pb-14 pt-28 sm:pb-16 sm:pt-32">
        <div className="container-app">
          <BlogGrid />
        </div>
      </section>
    </>
  );
}
