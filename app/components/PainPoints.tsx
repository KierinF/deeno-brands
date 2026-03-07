"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const symptoms = [
  {
    symptom: "Digital Invisibility",
    dying: "Not found in Google's top 10",
    thriving: "Dominating local search — maps + organic",
  },
  {
    symptom: "Budget Hemorrhage",
    dying: "Wasting money on ads that don't convert",
    thriving: "Every dollar tracked to a booked appointment",
  },
  {
    symptom: "Seasonal Atrophy",
    dying: "Phone not ringing enough in slow season",
    thriving: "Consistent lead flow 12 months a year",
  },
  {
    symptom: "Credibility Deficit",
    dying: "Website that loses trust on first glance",
    thriving: "A site that turns visitors into phone calls",
  },
  {
    symptom: "Attribution Blindness",
    dying: "No idea which marketing channel works",
    thriving: "Live dashboards showing real ROI by channel",
  },
  {
    symptom: "Lead Fatigue",
    dying: "Chasing unqualified leads instead of closing jobs",
    thriving: "Pre-qualified leads that are ready to buy",
  },
];

export default function PainPoints() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-32 px-6 relative overflow-hidden" style={{ background: "#181410" }}>
      {/* Giant background labels */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center">
        <span
          className="absolute left-[-2vw] top-1/2 -translate-y-1/2 select-none leading-none"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(60px, 10vw, 130px)",
            color: "rgba(212,82,42,0.04)",
          }}
        >
          DYING
        </span>
        <span
          className="absolute right-[-2vw] top-1/2 -translate-y-1/2 select-none leading-none"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(60px, 10vw, 130px)",
            color: "rgba(139,92,246,0.05)",
          }}
        >
          THRIVING
        </span>
      </div>

      {/* Center vertical rule */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={inView ? { scaleY: 1 } : {}}
        transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="absolute left-1/2 top-24 bottom-24 w-px origin-top hidden md:block"
        style={{ background: "rgba(201,168,76,0.12)" }}
      />

      <div className="max-w-5xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-20"
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
            [ EXHIBIT 02 // FIELD DIAGNOSTIC ]
          </span>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(28px, 4.5vw, 60px)",
              color: "#F2E8D5",
              lineHeight: 1.2,
              letterSpacing: "-0.02em",
              maxWidth: 620,
            }}
          >
            Common symptoms observed in businesses
            <span style={{ color: "rgba(242,232,213,0.3)", fontStyle: "italic" }}> approaching extinction.</span>
          </h2>
        </motion.div>

        {/* Column headers */}
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 mb-10">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-3"
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
              style={{ border: "1px solid rgba(212,82,42,0.3)", color: "#D4522A" }}
            >
              ✗
            </div>
            <span
              style={{
                fontFamily: '"SF Mono","Fira Code",monospace',
                fontSize: 10,
                letterSpacing: "0.18em",
                color: "rgba(212,82,42,0.5)",
                textTransform: "uppercase",
              }}
            >
              THE DYING — Without Deeno
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="flex items-center gap-3"
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-xs"
              style={{ border: "1px solid rgba(139,92,246,0.35)", color: "#8B5CF6" }}
            >
              ✓
            </div>
            <span
              style={{
                fontFamily: '"SF Mono","Fira Code",monospace',
                fontSize: 10,
                letterSpacing: "0.18em",
                color: "rgba(139,92,246,0.6)",
                textTransform: "uppercase",
              }}
            >
              THE THRIVING — With Deeno
            </span>
          </motion.div>
        </div>

        {/* Symptom rows */}
        <div className="space-y-0">
          {symptoms.map((s, i) => (
            <motion.div
              key={s.symptom}
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.4 + i * 0.06 }}
              className="group"
            >
              {/* Symptom divider */}
              <div
                className="py-1 mb-0"
                style={{
                  fontFamily: '"SF Mono","Fira Code",monospace',
                  fontSize: 9,
                  letterSpacing: "0.15em",
                  color: "rgba(201,168,76,0.25)",
                  textTransform: "uppercase",
                  borderTop: "1px solid rgba(201,168,76,0.08)",
                  paddingTop: 8,
                  marginTop: 0,
                }}
              >
                SYMPTOM: {s.symptom}
              </div>
              <div className="grid md:grid-cols-2 gap-12 md:gap-20 pb-5">
                {/* Dying */}
                <div className="flex items-start gap-4">
                  <span style={{ color: "rgba(212,82,42,0.4)", fontSize: 14, marginTop: 1, flexShrink: 0 }}>—</span>
                  <span
                    className="text-sm leading-relaxed"
                    style={{ color: "rgba(242,232,213,0.28)" }}
                  >
                    {s.dying}
                  </span>
                </div>
                {/* Thriving */}
                <div className="flex items-start gap-4">
                  <span style={{ color: "rgba(139,92,246,0.5)", fontSize: 14, marginTop: 1, flexShrink: 0 }}>→</span>
                  <span
                    className="text-sm leading-relaxed"
                    style={{ color: "rgba(242,232,213,0.65)" }}
                  >
                    {s.thriving}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
          <div style={{ borderTop: "1px solid rgba(201,168,76,0.08)", paddingTop: 8 }} />
        </div>
      </div>
    </section>
  );
}
