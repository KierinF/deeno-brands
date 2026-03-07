"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import CountUp from "./CountUp";

const stats = [
  { to: 340, suffix: "+", label: "Home Service\nBusinesses Served" },
  { to: 4.2, suffix: "M", decimals: 1, label: "Qualified Leads\nGenerated" },
  { to: 8.7, suffix: "x", decimals: 1, label: "Average Client\nReturn on Investment" },
];

export default function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-28 overflow-hidden bg-[#08080E]">
      {/* Giant background word */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <span className="text-[22vw] font-black text-white/[0.018] select-none tracking-tighter leading-none">
          GROWTH
        </span>
      </div>

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span className="text-[#FF5C28] text-[10px] font-bold tracking-[0.3em] uppercase">
            By the numbers
          </span>
        </motion.div>

        {/* Orange top rule */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="h-px bg-[#FF5C28]/60 origin-left mb-16"
        />

        {/* Stats grid */}
        <div className="grid grid-cols-3 divide-x divide-white/8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.7,
                delay: 0.15 + i * 0.1,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
              className="px-8 first:pl-0 last:pr-0 flex flex-col"
            >
              <span
                className="font-black text-white leading-none mb-4"
                style={{ fontSize: "clamp(56px, 10vw, 140px)", letterSpacing: "-0.04em" }}
              >
                {inView ? (
                  <CountUp to={s.to} suffix={s.suffix} decimals={s.decimals} duration={2.5} />
                ) : (
                  `0${s.suffix}`
                )}
              </span>
              <span className="text-white/35 text-sm leading-relaxed whitespace-pre-line">
                {s.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Orange bottom rule */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="h-px bg-[#FF5C28]/30 origin-left mt-16"
        />
      </div>
    </section>
  );
}
