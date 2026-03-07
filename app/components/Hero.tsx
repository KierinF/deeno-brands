"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import SplitText from "./SplitText";
import MagneticButton from "./MagneticButton";
import Marquee from "./Marquee";

const industryFacts = [
  "70% of homeowners search online before calling",
  "LSAs convert 2.5x higher than standard PPC",
  "Phone leads = 10–15x more revenue than web forms",
  "57% won't call a business under 4 stars",
  "#1 ranked businesses capture 33% of all clicks",
  "Local search drives $1.4T in consumer spending annually",
];

const stats = [
  { value: "31%", label: "avg. LSA conversion rate", sublabel: "industry benchmark" },
  { value: "10–15x", label: "phone vs. web lead value", sublabel: "industry benchmark" },
  { value: "70%", label: "homeowners search first", sublabel: "industry benchmark" },
];

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glowX = useSpring(useTransform(mouseX, [-1, 1], ["-4%", "4%"]), { stiffness: 50, damping: 20 });
  const glowY = useSpring(useTransform(mouseY, [-1, 1], ["-4%", "4%"]), { stiffness: 50, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(((e.clientX - rect.left) / rect.width - 0.5) * 2);
    mouseY.set(((e.clientY - rect.top) / rect.height - 0.5) * 2);
  };

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20 pb-0"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          style={{ x: glowX, y: glowY }}
          className="absolute top-[10%] left-[20%] w-[700px] h-[600px] rounded-full bg-[#FF5C28]/6 blur-[150px]"
        />
        <div className="absolute inset-0 dot-grid opacity-100" />
      </div>

      {/* Rotating ring — top right */}
      <div className="absolute top-24 right-8 w-[260px] h-[260px] opacity-25 animate-spin-slow pointer-events-none hidden xl:block">
        <svg viewBox="0 0 260 260" fill="none">
          <path
            id="hero-ring"
            d="M130,130 m-108,0 a108,108 0 1,1 216,0 a108,108 0 1,1,-216,0"
            fill="none"
          />
          <text fontSize="10.5" fill="#FF5C28" letterSpacing="3.5" fontWeight="600">
            <textPath href="#hero-ring">
              HOME SERVICES MARKETING • DEENO BRANDS • RESULTS DRIVEN •{" "}
            </textPath>
          </text>
          {/* Inner dashed circle */}
          <circle cx="130" cy="130" r="90" stroke="rgba(255,92,40,0.15)" strokeWidth="1" strokeDasharray="3 6" />
        </svg>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="inline-flex items-center gap-2 bg-[#FF5C28]/8 border border-[#FF5C28]/18 rounded-full px-4 py-1.5 mb-10 self-start"
        >
          <Zap size={10} className="text-[#FF5C28]" fill="#FF5C28" />
          <span className="text-[#FF5C28] text-[11px] font-semibold tracking-[0.18em] uppercase">
            Home Services Marketing Agency
          </span>
        </motion.div>

        {/* Headline — fills the width */}
        <h1
          className="font-black leading-[0.88] tracking-[-0.04em] mb-0"
          style={{ fontSize: "clamp(52px, 9.5vw, 140px)" }}
        >
          <span className="block overflow-hidden">
            <SplitText text="More Booked" delay={0.15} />
          </span>
          <span className="block overflow-hidden">
            <SplitText text="Jobs." delay={0.3} />
          </span>
          <span className="block overflow-hidden text-white/20">
            <SplitText text="Less Wasted" delay={0.48} />
          </span>
          <span className="block overflow-hidden text-white/20">
            <SplitText text="Budget." delay={0.63} />
          </span>
        </h1>

        {/* Horizontal rule */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, delay: 0.95, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="h-px bg-[#FF5C28]/50 origin-left my-8"
        />

        {/* Sub + CTAs row */}
        <div className="flex flex-col lg:flex-row lg:items-end gap-8 lg:gap-16 mb-12">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 0.6 }}
            className="text-base text-white/40 max-w-sm leading-relaxed italic font-light"
          >
            We build unfair marketing advantages for HVAC, plumbing, roofing,
            and electrical companies — predictable leads, measurable growth.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.15, duration: 0.6 }}
            className="flex flex-row gap-3 items-center shrink-0"
          >
            <MagneticButton>
              <a
                href="#contact"
                className="group inline-flex items-center gap-2 bg-[#FF5C28] text-white font-bold px-7 py-3.5 rounded-xl text-sm transition-all hover:shadow-[0_0_40px_rgba(255,92,40,0.4)] whitespace-nowrap"
                data-cursor-hover
              >
                Get Free Audit
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </a>
            </MagneticButton>
            <a
              href="#proof"
              className="text-white/40 hover:text-white text-sm font-medium transition-colors whitespace-nowrap"
            >
              See the data →
            </a>
          </motion.div>
        </div>

        {/* Trust + Stats row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10 pb-20"
        >
          {/* Inline industry stats */}
          <div className="flex flex-wrap gap-6 sm:gap-10">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col">
                <span className="text-2xl font-black text-white leading-none">{s.value}</span>
                <span className="text-white/40 text-[11px] mt-0.5">{s.label}</span>
                <span className="text-white/18 text-[9px] tracking-widest uppercase">{s.sublabel}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Client wins marquee — full width, bottom of section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.7 }}
        className="relative z-10 border-t border-white/5 bg-[#0A0A12]"
      >
        <div className="py-4">
          <Marquee duration={36}>
            {industryFacts.map((w) => (
              <span key={w} className="inline-flex items-center gap-3 px-8 text-xs font-semibold tracking-wide">
                <span className="w-1 h-1 rounded-full bg-[#FF5C28] shrink-0" />
                <span className="text-white/35 uppercase tracking-widest">{w}</span>
              </span>
            ))}
          </Marquee>
        </div>
      </motion.div>
    </section>
  );
}
