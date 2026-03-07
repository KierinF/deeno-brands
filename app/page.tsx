import Nav from "./components/Nav";
import Hero from "./components/Hero";
import StatsSection from "./components/StatsSection";
import PainPoints from "./components/PainPoints";
import Services from "./components/Services";
import ProofSection from "./components/ProofSection";
import Process from "./components/Process";
import EarlyAccess from "./components/EarlyAccess";
import FAQ from "./components/FAQ";
import CTA from "./components/CTA";
import Footer from "./components/Footer";
import SectionIndicator from "./components/SectionIndicator";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#08080E] text-white">
      <SectionIndicator />
      <Nav />
      <section id="hero">
        <Hero />
      </section>
      <StatsSection />
      <PainPoints />
      <Services />
      <ProofSection />
      <Process />
      <EarlyAccess />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
