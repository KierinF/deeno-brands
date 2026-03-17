import Nav from "./components/Nav";
import Hero from "./components/Hero";
import IndustrySelector from "./components/IndustrySelector";
import EssentialSection from "./components/EssentialSection";
import FounderSection from "./components/FounderSection";
import ClarityBlock from "./components/ClarityBlock";
import Process from "./components/Process";
import ProofSection from "./components/ProofSection";
import ObjectionsSection from "./components/ObjectionsSection";
import WhyDeeno from "./components/WhyDeeno";
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
      <ClarityBlock />
      <Process />
      <ProofSection />
      <ObjectionsSection />
      <WhyDeeno />
      <GuaranteeSection />
      <CTA />
      <Footer />
    </main>
  );
}
