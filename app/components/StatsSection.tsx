"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import CountUp from "./CountUp";

const guarantees = [
  {
    ref: "DB-G01",
    to: 30,
    suffix: "",
    unit: "days",
    label: "to your first\nqualified lead",
    sublabel: "or we adjust strategy, no charge",
    color: "#8B5CF6",
  },
  {
    ref: "DB-G02",
    to: 100,
    suffix: "%",
    unit: "",
    label: "asset ownership —\nyour site, your accounts",
    sublabel: "always yours, no lock-in games",
    color: "#F2E8D5",
  },
  {
    ref: "DB-G03",
    to: 0,
    suffix: "",
    unit: "",
    label: "lock-in contracts —\nmonth-to-month always",
    sublabel: "we earn your business every month",
    color: "#F2E8D5",
  },
];

export default function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="stats"
      ref={ref}
      className="relative py-28 overflow-hidden"
      style={{ background: "#0E0B07" }}
    >
      {/* Giant faded background word */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
        <span
          className="font-display leading-none tracking-tighter"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "22vw",
            color: "rgba(201,168,76,0.025)",
          }}
        >
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
          <span
            style={{
              fontFamily: '"SF Mono","Fira Code",monospace',
              fontSize: 10,
              letterSpacing: "0.2em",
              color: "rgba(201,168,76,0.65)",
              textTransform: "uppercase",
            }}
          >
            [ EXHIBIT 01 // FIELD OBSERVATIONS ]
          </span>
        </motion.div>

        {/* Gold top rule */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="origin-left mb-16"
          style={{ height: 1, background: "rgba(201,168,76,0.3)" }}
        />

        {/* Specimen cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px" style={{ background: "rgba(201,168,76,0.1)" }}>
          {guarantees.map((g, i) => (
            <motion.div
              key={g.ref}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.7,
                delay: 0.15 + i * 0.1,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
              className="relative flex flex-col p-8"
              style={{ background: "#0E0B07" }}
            >
              {/* Specimen reference label */}
              <div
                className="mb-6"
                style={{
                  fontFamily: '"SF Mono","Fira Code",monospace',
                  fontSize: 9,
                  letterSpacing: "0.18em",
                  color: "rgba(201,168,76,0.4)",
                  textTransform: "uppercase",
                }}
              >
                SPECIMEN REF: {g.ref}
              </div>

              {/* Big number */}
              <span
                className="leading-none mb-4"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "clamp(52px, 9vw, 120px)",
                  letterSpacing: "-0.03em",
                  color: g.color,
                }}
              >
                {inView ? (
                  <CountUp to={g.to} suffix={g.suffix} duration={2.5} />
                ) : (
                  `0${g.suffix}`
                )}
              </span>

              {/* Label */}
              <span
                className="leading-relaxed whitespace-pre-line mb-2"
                style={{ color: "rgba(242,232,213,0.45)", fontSize: 14 }}
              >
                {g.label}
              </span>
              <span
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontStyle: "italic",
                  fontSize: 12,
                  color: "rgba(242,232,213,0.2)",
                }}
              >
                {g.sublabel}
              </span>

              {/* "GUARANTEED IN WRITING" stamp */}
              <div
                className="mt-6 self-start px-2 py-0.5"
                style={{
                  fontFamily: '"SF Mono","Fira Code",monospace',
                  fontSize: 8,
                  letterSpacing: "0.2em",
                  color: "rgba(201,168,76,0.35)",
                  border: "1px solid rgba(201,168,76,0.2)",
                  textTransform: "uppercase",
                }}
              >
                GUARANTEED IN WRITING
              </div>
            </motion.div>
          ))}
        </div>

        {/* Gold bottom rule */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="origin-left mt-16"
          style={{ height: 1, background: "rgba(201,168,76,0.15)" }}
        />
      </div>
    </section>
  );
}
