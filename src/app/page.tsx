import { Hero } from "@/components/Hero";
import { Overview } from "@/components/Overview";
import { Offerings } from "@/components/Offerings";
import { Testimonials } from "@/components/Testimonials";
import { Insights } from "@/components/Insights";
import { Instructor } from "@/components/Instructor";
import { Footer } from "@/components/Footer";
import { Credentials } from "@/components/Credentials";
import { Programmes } from "@/components/Programmes";
import { SectionDivider } from "@/components/SectionDivider";
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <main id="main">
        <Hero />
        <Credentials />
        <SectionDivider type="dark-to-light" />
        <Overview />
        <Programmes />
        <SectionDivider type="light-to-dark" />
        <Offerings />
        <SectionDivider type="offerings-to-light" />
        <Testimonials />
        <Insights />
        <Instructor />
        <SectionDivider type="light-to-footer" />
      </main>
      <Footer />
    </>
  );
}
