import GridOverlay from "@/components/GridOverlay";
import SmoothScroll from "@/components/SmoothScroll";
import Reveal from "@/components/Reveal";
import CursorSparkles from "@/components/CursorSparkles";
import ScrollRuler from "@/components/ScrollRuler";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import WorkFrame from "@/components/WorkFrame";
import Services from "@/components/Services";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <GridOverlay />
      <SmoothScroll />
      <Reveal />
      <CursorSparkles />

      <Header />

      <main className="relative z-10">
        <Hero />
        <WorkFrame />
        <Services />
        <About />
        <Contact />
      </main>

      <Footer />
      <ScrollRuler />
    </>
  );
}
