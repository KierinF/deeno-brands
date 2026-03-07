"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import SplitText from "./SplitText";

const benefits = [
  {
    arrow: "→",
    title: "Direct access to Kierin",
    detail: "No account managers, no handoffs. You work directly with the founder.",
  },
  {
    arrow: "→",
    title: "Founding rate locked for 12 months",
    detail: "Early clients get our best pricing, frozen for a full year. Guaranteed in writing.",
  },
  {
    arrow: "→",
    title: "Week-1 onboarding, results tracked from day one",
    detail: "Campaigns live within 7 days. Full tracking stack installed before anything runs.",
  },
  {
    arrow: "→",
    title: "First-mover advantage in your market",
    detail: "We take one client per trade per city. Your competitor can't come in once you're in.",
  },
];

export default function EarlyAccess() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="early-access" ref={ref} className="py-32 px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#8B5CF6]/4 blur-[150px] pointer-events-none rounded-full translate-x-1/3 translate-y-1/3" />

      <div className="max-w-6xl mx-auto relative">
        <div className="grid lg:grid-cols-[1fr_360px] gap-16 lg:gap-20 items-start">
          {/* Left column */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
            >
              <span className="text-[#8B5CF6] text-[10px] font-bold tracking-[0.3em] uppercase mb-6 block">
                Now accepting clients
              </span>
            </motion.div>

            <h2
              className="font-black tracking-[-0.04em] leading-tight text-white mb-8"
              style={{ fontSize: "clamp(38px, 5.5vw, 80px)" }}
            >
              {inView && <SplitText text="Get in before" delay={0.1} />}
              <br />
              {inView && <SplitText text="everyone else." delay={0.3} className="gradient-text" />}
            </h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="text-white/45 text-base leading-relaxed mb-14 max-w-lg"
            >
              We&apos;re selectively onboarding our first clients in 2025. We only take one business per
              trade per city — so the window for your market is open right now, and may not be for long.
            </motion.p>

            {/* Benefits list */}
            <div className="space-y-8 mb-14">
              {benefits.map((b, i) => (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, x: -16 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="flex items-start gap-5 group"
                >
                  <span className="text-[#8B5CF6] font-bold text-base shrink-0 mt-0.5 group-hover:translate-x-1 transition-transform duration-200">
                    {b.arrow}
                  </span>
                  <div>
                    <div className="text-white font-semibold text-base mb-1">{b.title}</div>
                    <div className="text-white/35 text-sm leading-relaxed">{b.detail}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.75 }}
            >
              <a
                href="#contact"
                className="inline-flex items-center gap-3 text-white font-bold text-sm group"
              >
                <span className="w-9 h-9 rounded-full bg-[#8B5CF6] flex items-center justify-center group-hover:bg-[#7C3AED] transition-colors">
                  <ArrowRight size={15} />
                </span>
                Apply for a founding spot
              </a>
            </motion.div>
          </div>

          {/* Right column — large typographic element */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:flex items-center justify-center relative"
          >
            {/* FOUNDING vertical text */}
            <div className="relative h-[500px] flex items-center justify-center">
              <span
                className="font-black text-white/[0.04] select-none leading-none tracking-[-0.04em]"
                style={{
                  fontSize: "clamp(60px, 7vw, 110px)",
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                  transform: "rotate(180deg)",
                }}
              >
                FOUNDING
              </span>

              {/* Thin vertical orange accent line */}
              <motion.div
                initial={{ scaleY: 0 }}
                animate={inView ? { scaleY: 1 } : {}}
                transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-0 top-8 bottom-8 w-px bg-[#8B5CF6]/40 origin-top"
              />

              {/* Spot badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-0 right-0 w-20 h-20 rounded-full border border-[#8B5CF6]/30 flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="text-[#8B5CF6] font-black text-xl leading-none">1</div>
                  <div className="text-white/30 text-[8px] uppercase tracking-widest mt-0.5">per city</div>
                </div>
              </motion.div>

              {/* Trade badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
                className="absolute bottom-6 right-0 w-20 h-20 rounded-full border border-white/8 flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="text-white/50 font-black text-xl leading-none">1</div>
                  <div className="text-white/20 text-[8px] uppercase tracking-widest mt-0.5">per trade</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
