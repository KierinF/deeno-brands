import Nav from "./components/Nav";
import Hero from "./components/Hero";
import PainPoints from "./components/PainPoints";
import IndustrySelector from "./components/IndustrySelector";
import Process from "./components/Process";
import ProofSection from "./components/ProofSection";
import WhyDeeno from "./components/WhyDeeno";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main style={{ background: "#0A0A0A" }}>
      <Nav />
      <Hero />
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
