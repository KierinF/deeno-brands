"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import CountUp from "./CountUp";

const guarantees = [
  {
    to: 30,
    suffix: "",
    label: "days to your first\nqualified lead",
    sublabel: "or we adjust strategy, no charge",
    color: "#8B5CF6",
  },
  {
    to: 100,
    suffix: "%",
    label: "asset ownership —\nyour site, your accounts",
    sublabel: "always yours, no lock-in games",
    color: "white",
  },
  {
    to: 0,
    suffix: "",
    label: "lock-in contracts —\nmonth-to-month always",
    sublabel: "we earn your business every month",
    color: "white",
  },
];

export default function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="stats" ref={ref} className="relative py-28 overflow-hidden bg-[#08080E]">
      {/* Giant background word */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <span className="text-[22vw] font-black text-white/[0.018] select-none tracking-tighter leading-none">
          PROMISE
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
          <span className="text-[#8B5CF6] text-[10px] font-bold tracking-[0.3em] uppercase">
            Our guarantees
          </span>
        </motion.div>

        {/* Orange top rule */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="h-px bg-[#8B5CF6]/60 origin-left mb-16"
        />

        {/* Guarantees grid */}
        <div className="grid grid-cols-3 divide-x divide-white/8">
          {guarantees.map((g, i) => (
            <motion.div
              key={g.label}
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
                className="font-black leading-none mb-4"
                style={{
                  fontSize: "clamp(56px, 10vw, 140px)",
                  letterSpacing: "-0.04em",
                  color: g.color,
                }}
              >
                {inView ? (
                  <CountUp to={g.to} suffix={g.suffix} duration={2.5} />
                ) : (
                  `0${g.suffix}`
                )}
              </span>
              <span className="text-white/50 text-sm leading-relaxed whitespace-pre-line mb-2">
                {g.label}
              </span>
              <span className="text-white/20 text-xs italic font-light">{g.sublabel}</span>
            </motion.div>
          ))}
        </div>

        {/* Orange bottom rule */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="h-px bg-[#8B5CF6]/30 origin-left mt-16"
        />
      </div>
    </section>
  );
}
