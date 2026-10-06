import { Hero } from "@/components/Hero";
import { Overview } from "@/components/Overview";
import { Offerings } from "@/components/Offerings";
import { Testimonials } from "@/components/Testimonials";
import { Insights } from "@/components/Insights";
import { Instructor } from "@/components/Instructor";
import { Footer } from "@/components/Footer";
import { Credentials } from "@/components/Credentials";
import { Programmes } from "@/components/Programmes";
export default function Home() {
  return (
    <>
      <main id="main">
        <Hero />
        <Credentials />
        <Overview />
        <Programmes />
        <Offerings />
        <Testimonials />
        <Insights />
        <Instructor />
      </main>
      <Footer />
    </>
  );
}
