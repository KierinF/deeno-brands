"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import SplitText from "./SplitText";

const pains = [
  "Wasting money on ads that don't convert",
  "Phone not ringing enough in slow season",
  "Competitors outranking you on Google",
  "Website that loses trust on first glance",
  "No idea which marketing channel works",
  "Chasing leads instead of closing jobs",
];

const gains = [
  "Campaigns optimized for booked appointments",
  "Consistent lead flow 12 months a year",
  "Dominating local search — maps + organic",
  "A site that turns visitors into phone calls",
  "Live dashboards showing real ROI by channel",
  "Pre-qualified leads that are ready to buy",
];

export default function PainPoints() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-32 px-6 relative overflow-hidden">
      {/* Giant background labels */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center">
        <span
          className="absolute left-[-2vw] top-1/2 -translate-y-1/2 font-black text-white/[0.025] select-none leading-none"
          style={{ fontSize: "clamp(60px, 10vw, 130px)" }}
        >
          BEFORE
        </span>
        <span
          className="absolute right-[-2vw] top-1/2 -translate-y-1/2 font-black text-[#FF5C28]/[0.06] select-none leading-none"
          style={{ fontSize: "clamp(60px, 10vw, 130px)" }}
        >
          AFTER
        </span>
      </div>

      {/* Center vertical rule */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={inView ? { scaleY: 1 } : {}}
        transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="absolute left-1/2 top-24 bottom-24 w-px bg-white/8 origin-top hidden md:block"
      />

      <div className="max-w-5xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <span className="text-[#FF5C28] text-[10px] font-bold tracking-[0.3em] uppercase mb-4 block">
            The difference
          </span>
          <h2
            className="font-black tracking-[-0.03em] leading-tight"
            style={{ fontSize: "clamp(36px, 5.5vw, 72px)" }}
          >
            {inView && <SplitText text="Tired of marketing that" delay={0.1} />}
            <br />
            {inView && <SplitText text="drains your budget?" delay={0.3} />}
          </h2>
        </motion.div>

        {/* Dual column — editorial, no cards */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-20">
          {/* Before column */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex items-center gap-3 mb-10"
            >
              <div className="w-5 h-5 rounded-full border border-white/15 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-white/25" />
              </div>
              <span className="text-white/30 text-xs font-semibold uppercase tracking-widest">
                Without Deeno
              </span>
            </motion.div>

            <div className="space-y-7">
              {pains.map((pain, i) => (
                <motion.div
                  key={pain}
                  initial={{ opacity: 0, x: -12 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 + i * 0.07 }}
                  className="flex items-start gap-4 group"
                >
                  <span className="text-white/15 font-light text-sm mt-0.5 shrink-0">—</span>
                  <span className="text-white/35 text-sm leading-relaxed group-hover:text-white/50 transition-colors">
                    {pain}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* After column */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="flex items-center gap-3 mb-10"
            >
              <div className="w-5 h-5 rounded-full border border-[#FF5C28]/30 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF5C28]" />
              </div>
              <span className="text-[#FF5C28] text-xs font-semibold uppercase tracking-widest">
                With Deeno
              </span>
            </motion.div>

            <div className="space-y-7">
              {gains.map((gain, i) => (
                <motion.div
                  key={gain}
                  initial={{ opacity: 0, x: 12 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.45 + i * 0.07 }}
                  className="flex items-start gap-4 group"
                >
                  <span className="text-[#FF5C28]/60 font-light text-sm mt-0.5 shrink-0">→</span>
                  <span className="text-white/70 text-sm leading-relaxed group-hover:text-white transition-colors">
                    {gain}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
