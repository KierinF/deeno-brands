import Nav from "./components/Nav";
import Hero from "./components/Hero";
import IndustrySelector from "./components/IndustrySelector";
import EssentialSection from "./components/EssentialSection";
import FounderSection from "./components/FounderSection";
import Process from "./components/Process";
import ProofSection from "./components/ProofSection";
import GuaranteeSection from "./components/GuaranteeSection";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main style={{ background: "#F7F4EE" }}>
      <Nav />
      <Hero />
      <IndustrySelector />
      <EssentialSection />
      <FounderSection />
      <Process />
      <ProofSection />
      <GuaranteeSection />
      <CTA />
      <Footer />
    </main>
  );
}
