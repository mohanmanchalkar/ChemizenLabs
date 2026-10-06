import { Hero } from "@/components/Hero";
import { Overview } from "@/components/Overview";
import { Offerings } from "@/components/Offerings";
import { Testimonials } from "@/components/Testimonials";
import { Insights } from "@/components/Insights";
import { Instructor } from "@/components/Instructor";
import { Footer } from "@/components/Footer";
export default function Home() {
  return (
    <>
      <main id="main">
        <Hero />
        <Overview />
        <Offerings />
        <Testimonials />
        <Insights />
        <Instructor />
      </main>
      <Footer />
    </>
  );
}
