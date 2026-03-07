"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Star, TrendingUp, Phone, MapPin, Zap } from "lucide-react";
import SplitText from "./SplitText";
import MagneticButton from "./MagneticButton";
import CountUp from "./CountUp";
import Marquee from "./Marquee";

const logos = [
  "Atlas HVAC",
  "ProPlumb Co.",
  "Guardian Electric",
  "RoofCraft",
  "AirMasters",
  "CleanSeal Pest",
  "Harrington HVAC",
  "Summit Plumbing",
];

const stats = [
  { to: 340, suffix: "+", label: "Clients Served" },
  { to: 4.2, suffix: "M", prefix: "", decimals: 1, label: "Leads Generated" },
  { to: 8.7, suffix: "x", decimals: 1, label: "Average ROI" },
];

// Floating metric dashboard cards
const metricCards = [
  {
    id: "calls",
    label: "Calls This Month",
    value: "94",
    delta: "+683%",
    positive: true,
    offsetY: -24,
    rotate: -2,
    delay: 0.6,
    chart: [18, 25, 20, 40, 35, 55, 60, 80, 75, 94],
  },
  {
    id: "cpl",
    label: "Cost Per Lead",
    value: "$48",
    delta: "↓ from $340",
    positive: true,
    offsetY: 32,
    rotate: 1.5,
    delay: 0.75,
    chart: [340, 280, 210, 165, 120, 90, 70, 55, 50, 48],
  },
  {
    id: "rank",
    label: "Google Map Rank",
    value: "#1",
    delta: "Map Pack",
    positive: true,
    offsetY: 80,
    rotate: -1,
    delay: 0.9,
    chart: null,
  },
];

function SparkLine({ values, positive }: { values: number[]; positive: boolean }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline
        points={pts}
        stroke={positive ? "#34d399" : "#f87171"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);

  // Mouse parallax for background glow
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const glowX = useSpring(useTransform(mouseX, [-1, 1], ["-3%", "3%"]), { stiffness: 60, damping: 20 });
  const glowY = useSpring(useTransform(mouseY, [-1, 1], ["-3%", "3%"]), { stiffness: 60, damping: 20 });

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
      className="relative min-h-screen flex flex-col justify-center overflow-hidden pt-20 pb-8"
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          style={{ x: glowX, y: glowY }}
          className="absolute top-[20%] left-[30%] w-[700px] h-[500px] rounded-full bg-[#FF5C28]/8 blur-[140px]"
        />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-purple-600/4 blur-[100px]" />
        <div className="absolute inset-0 dot-grid opacity-100" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="grid lg:grid-cols-[1fr_480px] gap-12 xl:gap-20 items-center min-h-[80vh]">

          {/* LEFT — Text content */}
          <div className="flex flex-col justify-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-[#FF5C28]/10 border border-[#FF5C28]/20 rounded-full px-4 py-1.5 mb-7 self-start"
            >
              <Zap size={11} className="text-[#FF5C28]" fill="#FF5C28" />
              <span className="text-[#FF5C28] text-xs font-semibold tracking-wider uppercase">
                The #1 Home Services Growth Agency
              </span>
            </motion.div>

            {/* Headline — word-by-word reveal */}
            <h1 className="text-[clamp(42px,7vw,88px)] font-black leading-[0.93] tracking-[-0.03em] mb-6">
              <span className="block">
                <SplitText text="More Booked" delay={0.2} />
              </span>
              <span className="block">
                <SplitText text="Jobs." delay={0.35} />
              </span>
              <span className="block mt-1">
                <SplitText
                  text="Less Wasted"
                  delay={0.5}
                  className="gradient-text"
                />
              </span>
              <span className="block">
                <SplitText text="Budget." delay={0.65} className="gradient-text" />
              </span>
            </h1>

            {/* Sub */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="text-base md:text-lg text-white/45 max-w-md leading-relaxed mb-10"
            >
              We build unfair marketing advantages for HVAC, plumbing, roofing,
              and electrical companies. Predictable leads. Measurable growth.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.05, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-3 mb-12"
            >
              <MagneticButton>
                <a
                  href="#contact"
                  className="group inline-flex items-center gap-2 bg-[#FF5C28] text-white font-bold px-8 py-4 rounded-xl text-sm transition-all duration-200 hover:shadow-[0_0_50px_rgba(255,92,40,0.45)] whitespace-nowrap"
                  data-cursor-hover
                >
                  Get Your Free Growth Audit
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
                </a>
              </MagneticButton>
              <a
                href="#results"
                className="inline-flex items-center justify-center gap-2 bg-white/4 hover:bg-white/8 border border-white/8 text-white/80 hover:text-white font-semibold px-7 py-4 rounded-xl text-sm transition-all duration-200"
              >
                See Client Results
              </a>
            </motion.div>

            {/* Trust */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              className="flex items-center gap-4"
            >
              <div className="flex -space-x-2.5">
                {["JH", "MO", "TR", "SC", "DW"].map((init, i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full border-2 border-[#08080E] bg-gradient-to-br from-orange-400 to-orange-700 flex items-center justify-center text-white text-[10px] font-black"
                  >
                    {init}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5 mb-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={11} className="text-[#FF5C28] fill-[#FF5C28]" />
                  ))}
                </div>
                <p className="text-white/35 text-xs">340+ home service businesses</p>
              </div>
            </motion.div>
          </div>

          {/* RIGHT — Floating dashboard cards */}
          <div className="hidden lg:block relative h-[480px]">
            {/* Background card glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 rounded-full bg-[#FF5C28]/8 blur-[80px]" />
            </div>

            {/* Card 1 — Calls */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              style={{ rotate: -2 }}
              className="absolute top-8 left-0 w-52"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="bg-[#0F0F18]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <Phone size={12} className="text-[#FF5C28]" />
                    <span className="text-white/50 text-xs">Calls / Month</span>
                  </div>
                  <span className="text-emerald-400 text-xs font-semibold">+683%</span>
                </div>
                <div className="text-3xl font-black text-white mb-2">94</div>
                <SparkLine values={[18, 25, 20, 40, 35, 55, 60, 80, 75, 94]} positive />
              </motion.div>
            </motion.div>

            {/* Card 2 — CPL */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.78, duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              style={{ rotate: 1.5 }}
              className="absolute top-1/2 -translate-y-1/2 right-4 w-56"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="bg-[#0F0F18]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={12} className="text-[#FF5C28]" />
                    <span className="text-white/50 text-xs">Cost Per Lead</span>
                  </div>
                  <span className="text-emerald-400 text-xs font-semibold">↓ 86%</span>
                </div>
                <div className="text-3xl font-black text-white mb-2">$48</div>
                <SparkLine values={[340, 260, 200, 155, 115, 88, 68, 54, 50, 48]} positive={false} />
                <div className="mt-2 text-white/25 text-xs line-through">Was $340</div>
              </motion.div>
            </motion.div>

            {/* Card 3 — Rank */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.95, duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              style={{ rotate: -1 }}
              className="absolute bottom-8 left-12 w-44"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="bg-[#0F0F18]/90 backdrop-blur-xl border border-[#FF5C28]/20 rounded-2xl p-4 shadow-2xl"
              >
                <div className="flex items-center gap-1.5 mb-3">
                  <MapPin size={12} className="text-[#FF5C28]" />
                  <span className="text-white/50 text-xs">Google Rank</span>
                </div>
                <div className="text-4xl font-black gradient-text mb-1">#1</div>
                <div className="text-xs text-white/40">Maps · Pack · Organic</div>
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 text-xs">Live</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Connecting line accent */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-10" viewBox="0 0 480 480">
              <line x1="180" y1="130" x2="330" y2="240" stroke="#FF5C28" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="330" y1="240" x2="220" y2="380" stroke="#FF5C28" strokeWidth="1" strokeDasharray="4 4" />
            </svg>
          </div>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.7 }}
          className="grid grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5 max-w-xl mt-4 lg:mt-0"
        >
          {stats.map((s) => (
            <div key={s.label} className="bg-[#0F0F18] px-6 py-5 flex flex-col items-center">
              <span className="text-3xl font-black gradient-text mb-0.5">
                <CountUp
                  to={s.to}
                  suffix={s.suffix}
                  prefix={s.prefix}
                  decimals={s.decimals}
                />
              </span>
              <span className="text-white/35 text-xs text-center">{s.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Marquee logo ticker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="relative z-10 mt-16 border-t border-white/5"
      >
        <div className="py-5">
          <p className="text-center text-white/20 text-[10px] font-semibold uppercase tracking-[0.2em] mb-4">
            Trusted by leading home service brands
          </p>
          <Marquee duration={28}>
            {logos.map((l) => (
              <span
                key={l}
                className="text-white/20 font-bold text-sm tracking-wide px-8 hover:text-white/50 transition-colors"
              >
                {l}
              </span>
            ))}
          </Marquee>
        </div>
      </motion.div>
    </section>
  );
}
