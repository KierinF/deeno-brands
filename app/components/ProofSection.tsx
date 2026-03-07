"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import CountUp from "./CountUp";

const stats = [
  {
    number: 70,
    suffix: "%",
    label: "of homeowners search online before calling a contractor",
    context: "If you're not ranking, you don't exist.",
    source: "Invoca, 2025",
  },
  {
    number: 2.5,
    suffix: "x",
    decimals: 1,
    label: "higher conversion rate for Google Local Services Ads vs. standard PPC",
    context: "The channel most agencies ignore.",
    source: "HomeServiceDirect",
  },
  {
    number: 15,
    suffix: "x",
    label: "more revenue from phone call leads vs. web form submissions",
    context: "Calls close. Forms don't.",
    source: "CallRail",
  },
  {
    number: 57,
    suffix: "%",
    label: "of consumers won't call a business with less than 4 stars",
    context: "Reputation is revenue.",
    source: "BrightLocal",
  },
];

function StatRow({ stat, index }: { stat: typeof stats[0]; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="relative">
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-0 left-0 right-0 h-px bg-white/6 origin-left"
      />

      <div className="grid grid-cols-[1fr_2fr] md:grid-cols-[280px_1fr_200px] gap-0 items-center py-10 md:py-12 group">
        {/* Number */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 + index * 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="relative"
        >
          <span
            className="font-black text-white leading-none"
            style={{ fontSize: "clamp(56px, 9vw, 120px)", letterSpacing: "-0.04em" }}
          >
            {inView ? (
              <CountUp to={stat.number} suffix={stat.suffix} decimals={stat.decimals} duration={2} />
            ) : (
              `0${stat.suffix}`
            )}
          </span>
        </motion.div>

        {/* Label + context */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.17 + index * 0.05 }}
          className="pl-6 md:pl-10 pr-4"
        >
          <p className="text-white/55 text-sm md:text-base leading-relaxed mb-2 max-w-lg">
            {stat.label}
          </p>
          <p className="text-[#FF5C28] text-sm font-semibold italic">
            {stat.context}
          </p>
        </motion.div>

        {/* Source — desktop only */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
          className="hidden md:flex justify-end"
        >
          <span className="text-white/18 text-[10px] uppercase tracking-widest text-right">
            Source:<br />{stat.source}
          </span>
        </motion.div>
      </div>

      {index === stats.length - 1 && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-0 left-0 right-0 h-px bg-white/6 origin-left"
        />
      )}
    </div>
  );
}

export default function ProofSection() {
  const headerRef = useRef(null);
  const inView = useInView(headerRef, { once: true, margin: "-80px" });

  return (
    <section id="proof" className="py-32 px-6 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#FF5C28]/3 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div ref={headerRef} className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[#FF5C28] text-[10px] font-bold tracking-[0.3em] uppercase mb-4 block">
              The proof
            </span>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <h2
                className="font-black tracking-[-0.04em] leading-tight text-white"
                style={{ fontSize: "clamp(40px, 6vw, 88px)" }}
              >
                Why digital marketing<br />
                <span className="text-white/30">can&apos;t wait.</span>
              </h2>
              <p className="text-white/22 text-sm font-light italic max-w-xs leading-relaxed hidden md:block">
                Industry data, independently verified.<br />
                This is the market you&apos;re competing in.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="h-px bg-[#FF5C28]/40 origin-left mt-10"
          />
        </div>

        {/* Stat rows */}
        <div>
          {stats.map((stat, i) => (
            <StatRow key={stat.source + i} stat={stat} index={i} />
          ))}
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 text-white/15 text-xs"
        >
          Data from publicly available industry research. We cite sources because we believe in honesty.
        </motion.p>
      </div>
    </section>
  );
}
