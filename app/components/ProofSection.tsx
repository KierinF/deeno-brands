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
    suffix: "×",
    decimals: 1,
    label: "higher conversion rate for Google Local Services Ads vs. standard PPC",
    context: "The channel most agencies ignore.",
    source: "HomeServiceDirect",
  },
  {
    number: 15,
    suffix: "×",
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
        className="absolute top-0 left-0 right-0 h-px origin-left"
        style={{ background: "rgba(201,168,76,0.1)" }}
      />

      <div className="grid grid-cols-[1fr_2fr] md:grid-cols-[260px_1fr_200px] gap-0 items-center py-10 md:py-12">
        {/* Number */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 + index * 0.05, ease: [0.16, 1, 0.3, 1] }}
        >
          <span
            className="leading-none"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(52px, 8vw, 110px)",
              color: "#F2E8D5",
              letterSpacing: "-0.03em",
            }}
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
          <p className="text-sm md:text-base leading-relaxed mb-2 max-w-lg" style={{ color: "rgba(242,232,213,0.45)" }}>
            {stat.label}
          </p>
          <p
            className="text-sm font-semibold"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: "italic",
              color: "#8B5CF6",
            }}
          >
            {stat.context}
          </p>
        </motion.div>

        {/* Source */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
          className="hidden md:flex justify-end"
        >
          <span
            className="text-right"
            style={{
              fontFamily: '"SF Mono","Fira Code",monospace',
              fontSize: 9,
              letterSpacing: "0.14em",
              color: "rgba(201,168,76,0.25)",
              textTransform: "uppercase",
              lineHeight: 1.8,
            }}
          >
            SOURCE:<br />{stat.source}
          </span>
        </motion.div>
      </div>

      {index === stats.length - 1 && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-0 left-0 right-0 h-px origin-left"
          style={{ background: "rgba(201,168,76,0.1)" }}
        />
      )}
    </div>
  );
}

export default function ProofSection() {
  const headerRef = useRef(null);
  const inView = useInView(headerRef, { once: true, margin: "-80px" });

  return (
    <section id="proof" className="py-32 px-6 relative overflow-hidden" style={{ background: "#181410" }}>
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{
          width: 800, height: 400,
          borderRadius: "50%",
          background: "rgba(139,92,246,0.03)",
          filter: "blur(120px)",
        }}
      />

      <div className="max-w-6xl mx-auto relative">
        <div ref={headerRef} className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <span
              style={{
                fontFamily: '"SF Mono","Fira Code",monospace',
                fontSize: 10,
                letterSpacing: "0.2em",
                color: "rgba(201,168,76,0.65)",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 20,
              }}
            >
              [ EXHIBIT 04 // THE EVIDENCE ]
            </span>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "clamp(36px, 5.5vw, 80px)",
                  color: "#F2E8D5",
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                }}
              >
                Why digital marketing<br />
                <span style={{ color: "rgba(242,232,213,0.28)" }}>can&apos;t wait.</span>
              </h2>
              <p
                className="text-sm hidden md:block max-w-xs leading-relaxed"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: "italic",
                  color: "rgba(242,232,213,0.2)",
                }}
              >
                Industry data, independently verified.<br />
                This is the market you&apos;re competing in.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="h-px origin-left mt-10"
            style={{ background: "rgba(201,168,76,0.25)" }}
          />
        </div>

        <div>
          {stats.map((stat, i) => (
            <StatRow key={stat.source + i} stat={stat} index={i} />
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-10 text-xs"
          style={{
            fontFamily: '"SF Mono","Fira Code",monospace',
            color: "rgba(242,232,213,0.12)",
            letterSpacing: "0.06em",
          }}
        >
          Data from publicly available industry research. We cite sources because we believe in honesty.
        </motion.p>
      </div>
    </section>
  );
}
