import Nav from "./components/Nav";
import Hero from "./components/Hero";
import PainPoints from "./components/PainPoints";
import Services from "./components/Services";
import Results from "./components/Results";
import Process from "./components/Process";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import CTA from "./components/CTA";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#08080E] text-white">
      <Nav />
      <Hero />
      <PainPoints />
      <Services />
      <Results />
      <Process />
      <Testimonials />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
