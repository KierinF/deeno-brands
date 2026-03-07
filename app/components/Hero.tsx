"use client";

import { motion } from "framer-motion";
import { ArrowRight, Star, TrendingUp, Users, Zap } from "lucide-react";

const stats = [
  { value: "340+", label: "Home Service Clients" },
  { value: "4.2M", label: "Leads Generated" },
  { value: "8.7x", label: "Average ROI" },
];

const logos = [
  "Atlas HVAC",
  "ProPlumb Co.",
  "Guardian Electric",
  "RoofCraft",
  "AirMasters",
  "CleanSeal",
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  }),
};

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] rounded-full bg-[#FF5C28]/10 blur-[120px]" />
        <div className="absolute top-2/3 left-1/4 w-[400px] h-[300px] rounded-full bg-[#FF5C28]/5 blur-[80px]" />
      </div>

      {/* Grid lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2 bg-[#FF5C28]/10 border border-[#FF5C28]/20 rounded-full px-4 py-1.5 mb-8"
        >
          <Zap size={12} className="text-[#FF5C28]" fill="#FF5C28" />
          <span className="text-[#FF5C28] text-xs font-semibold tracking-wider uppercase">
            The #1 Home Services Marketing Agency
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.95] mb-6"
        >
          More Booked Jobs.
          <br />
          <span className="gradient-text">Less Wasted Budget.</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          We build unfair marketing advantages for HVAC, plumbing, roofing, and
          electrical companies. Predictable leads. Measurable growth.
        </motion.p>

        {/* CTAs */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
        >
          <a
            href="#contact"
            className="group inline-flex items-center justify-center gap-2 bg-[#FF5C28] hover:bg-[#e64f20] text-white font-bold px-8 py-4 rounded-xl text-base transition-all duration-200 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,92,40,0.4)] active:scale-[0.98]"
          >
            Get Your Free Growth Audit
            <ArrowRight
              size={18}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </a>
          <a
            href="#results"
            className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all duration-200"
          >
            See Client Results
          </a>
        </motion.div>

        {/* Trust strip */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex items-center justify-center gap-6 mb-20"
        >
          <div className="flex -space-x-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-[#08080E] bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-xs font-bold"
              >
                {["J", "M", "R", "T", "A"][i]}
              </div>
            ))}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-0.5 mb-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className="text-[#FF5C28] fill-[#FF5C28]"
                />
              ))}
            </div>
            <p className="text-white/40 text-xs">
              Trusted by 340+ home service businesses
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/5 max-w-2xl mx-auto mb-24"
        >
          {stats.map((s) => (
            <div
              key={s.value}
              className="bg-[#0F0F18] px-6 py-6 flex flex-col items-center"
            >
              <span className="text-3xl md:text-4xl font-black gradient-text mb-1">
                {s.value}
              </span>
              <span className="text-white/40 text-xs text-center">{s.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Logo ticker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.8 }}
        className="relative z-10 w-full border-t border-white/5 py-6"
      >
        <p className="text-center text-white/25 text-xs font-semibold uppercase tracking-widest mb-5">
          Trusted by industry leaders
        </p>
        <div className="flex items-center justify-center flex-wrap gap-x-10 gap-y-3 px-6">
          {logos.map((l) => (
            <span
              key={l}
              className="text-white/20 font-bold text-sm tracking-wide hover:text-white/50 transition-colors cursor-default"
            >
              {l}
            </span>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
