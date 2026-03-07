"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const steps = [
  {
    num: "01",
    phase: "PHASE 01 / DIAGNOSIS",
    title: "Free Growth\nAudit",
    description:
      "We dig into your current marketing, competitors, and local market. You get a real analysis of what's broken and exactly where the money is being lost.",
    duration: "Week 1",
    detail: "Competitor analysis · GMB review · Ad account audit · Keyword gaps",
  },
  {
    num: "02",
    phase: "PHASE 02 / STRATEGY",
    title: "Custom\nProtocol",
    description:
      "We build a 90-day roadmap specific to your trade, market, and goals. Every channel has a purpose. Every dollar has a destination.",
    duration: "Week 1–2",
    detail: "Channel mix · Budget allocation · 90-day roadmap · KPI targets",
  },
  {
    num: "03",
    phase: "PHASE 03 / TREATMENT",
    title: "Launch &\nExecute",
    description:
      "Our team builds campaigns, optimizes your site, and gets your GMB firing on all cylinders. Most clients see qualified leads within 30 days.",
    duration: "Week 2–4",
    detail: "Campaign build · Site optimization · GMB setup · Tracking install",
  },
  {
    num: "04",
    phase: "PHASE 04 / EVOLUTION",
    title: "Report &\nScale",
    description:
      "Monthly strategy calls, live dashboards, data-driven decisions. We scale what converts and ruthlessly cut what doesn't.",
    duration: "Ongoing",
    detail: "Live dashboard · Monthly calls · CPA optimization · Scale",
  },
];

function StepRow({ step, index, isLast }: { step: (typeof steps)[0]; index: number; isLast: boolean }) {
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

      <div className="grid grid-cols-[80px_1fr] md:grid-cols-[200px_1fr_260px] gap-0 items-center py-12 md:py-14">
        {/* Left: phase label */}
        <div className="relative flex flex-col justify-center">
          {/* Giant faded number */}
          <span
            className="absolute -left-2 top-1/2 -translate-y-1/2 select-none pointer-events-none leading-none"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(70px, 12vw, 150px)",
              color: "rgba(201,168,76,0.04)",
              letterSpacing: "-0.04em",
            }}
          >
            {step.num}
          </span>

          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.1 + index * 0.06 }}
            className="relative z-10 flex flex-col gap-1.5"
          >
            <span
              style={{
                fontFamily: '"SF Mono","Fira Code",monospace',
                fontSize: 8,
                letterSpacing: "0.18em",
                color: "rgba(201,168,76,0.5)",
                textTransform: "uppercase",
              }}
            >
              {step.phase}
            </span>
            <span
              style={{
                fontFamily: '"SF Mono","Fira Code",monospace',
                fontSize: 8,
                letterSpacing: "0.15em",
                color: "rgba(242,232,213,0.18)",
                textTransform: "uppercase",
                marginTop: 2,
              }}
            >
              {step.duration}
            </span>
          </motion.div>
        </div>

        {/* Center: title + description */}
        <div className="pl-4 md:pl-8 pr-4 md:pr-14">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 + index * 0.06 }}
            className="leading-[1.1] whitespace-pre-line mb-4"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(22px, 3vw, 42px)",
              color: "#F2E8D5",
              letterSpacing: "-0.02em",
            }}
          >
            {step.title}
          </motion.h3>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.22 + index * 0.06 }}
            className="text-sm leading-relaxed max-w-lg"
            style={{ color: "rgba(242,232,213,0.35)" }}
          >
            {step.description}
          </motion.p>
        </div>

        {/* Right: detail tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.32 + index * 0.06 }}
          className="hidden md:flex flex-wrap gap-2 content-start"
        >
          {step.detail.split(" · ").map((tag) => (
            <span
              key={tag}
              className="text-[9px] font-semibold tracking-wide px-3 py-1"
              style={{
                fontFamily: '"SF Mono","Fira Code",monospace',
                letterSpacing: "0.1em",
                color: "rgba(201,168,76,0.35)",
                border: "1px solid rgba(201,168,76,0.15)",
                borderRadius: 2,
                textTransform: "uppercase",
              }}
            >
              {tag}
            </span>
          ))}
        </motion.div>
      </div>

      {isLast && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="absolute bottom-0 left-0 right-0 h-px origin-left"
          style={{ background: "rgba(201,168,76,0.1)" }}
        />
      )}
    </div>
  );
}

export default function Process() {
  const headerRef = useRef(null);
  const inView = useInView(headerRef, { once: true, margin: "-80px" });

  return (
    <section id="process" className="py-32 px-6 relative overflow-hidden" style={{ background: "#0E0B07" }}>
      {/* Giant faded word */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
        <span
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "28vw",
            color: "rgba(201,168,76,0.018)",
            lineHeight: 1,
          }}
        >
          HOW
        </span>
      </div>

      <div className="max-w-6xl mx-auto relative">
        <div ref={headerRef} className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
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
                [ EXHIBIT 05 // THE SURVIVAL PROTOCOL ]
              </span>
              <h2
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "clamp(36px, 5.5vw, 80px)",
                  color: "#F2E8D5",
                  lineHeight: 1.15,
                  letterSpacing: "-0.02em",
                }}
              >
                Diagnosis to booked jobs
                <br />
                <span className="gradient-text">in 30 days.</span>
              </h2>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="hidden md:block max-w-xs leading-relaxed"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: "italic",
                fontSize: 14,
                color: "rgba(242,232,213,0.2)",
              }}
            >
              No fluff. No retainers-for-nothing.
              <br />A systematic path from zero to dominant.
            </motion.p>
          </motion.div>
        </div>

        <div>
          {steps.map((step, i) => (
            <StepRow key={step.num} step={step} index={i} isLast={i === steps.length - 1} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-14 flex items-center gap-6"
        >
          <a
            href="#contact"
            className="inline-flex items-center gap-2.5 font-bold px-7 py-3.5 rounded-xl text-sm transition-all"
            style={{
              background: "#8B5CF6",
              color: "#fff",
              letterSpacing: "0.04em",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = "#7C3AED";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 0 30px rgba(139,92,246,0.35)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = "#8B5CF6";
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
            }}
          >
            Begin your diagnosis
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
          <span className="text-sm" style={{ color: "rgba(242,232,213,0.22)", fontStyle: "italic" }}>
            Free. No commitment.
          </span>
        </motion.div>
      </div>
    </section>
  );
}
