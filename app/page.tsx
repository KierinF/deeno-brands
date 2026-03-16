import Nav from "./components/Nav";
import Hero from "./components/Hero";
import EssentialSection from "./components/EssentialSection";
import IndustrySelector from "./components/IndustrySelector";
import PainPoints from "./components/PainPoints";
import Process from "./components/Process";
import ProofSection from "./components/ProofSection";
import WhyDeeno from "./components/WhyDeeno";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main style={{ background: "#F7F4EE" }}>
      <Nav />
      <Hero />
      <EssentialSection />
      <IndustrySelector />
      <PainPoints />
      <Process />
      <ProofSection />
      <WhyDeeno />
      <CTA />
      <Footer />
    </main>
  );
}
