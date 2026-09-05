import dynamic from "next/dynamic";

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
import Intro from "@/components/Intro";
import Cursor from "@/components/Cursor";

const HeroObject = dynamic(() => import("@/components/ParticleSphere"));

export default function Home() {
  return (
    <>
      <Intro />
      <Cursor />

      <GridOverlay />

      {/*
        The hero object sits on its own fixed layer rather than inside the
        hero section, so it can keep travelling down the viewport as you
        scroll instead of being clipped by the section it started in.
      */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{ zIndex: 3 }}
        aria-hidden
      >
        <HeroObject />
      </div>
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
