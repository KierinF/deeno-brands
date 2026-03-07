import Intro from "./components/Intro";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import StatsSection from "./components/StatsSection";
import Services from "./components/Services";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main style={{ background: "#EDEAE0" }}>
      <Intro />
      <Nav />
      <section id="hero">
        <Hero />
      </section>
      <StatsSection />
      <Services />
      <CTA />
      <Footer />
    </main>
  );
}
