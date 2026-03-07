"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import SplitText from "./SplitText";

const steps = [
  {
    num: "01",
    title: "Free Growth\nAudit",
    description:
      "We dig into your current marketing, competitors, and local market. You get a real analysis of what's broken and exactly where the money is being lost.",
    duration: "Week 1",
    detail: "Competitor analysis · GMB review · Ad account audit · Keyword gaps",
  },
  {
    num: "02",
    title: "Custom\nStrategy",
    description:
      "We build a 90-day roadmap specific to your trade, market, and goals. Every channel has a purpose. Every dollar has a destination.",
    duration: "Week 1–2",
    detail: "Channel mix · Budget allocation · 90-day roadmap · KPI targets",
  },
  {
    num: "03",
    title: "Launch &\nExecute",
    description:
      "Our team builds campaigns, optimizes your site, and gets your GMB firing on all cylinders. Most clients see qualified leads within 30 days.",
    duration: "Week 2–4",
    detail: "Campaign build · Site optimization · GMB setup · Tracking install",
  },
  {
    num: "04",
    title: "Report &\nScale",
    description:
      "Monthly strategy calls, live dashboards, data-driven decisions. We scale what converts and ruthlessly cut what doesn't.",
    duration: "Ongoing",
    detail: "Live dashboard · Monthly calls · CPA optimization · Scale",
  },
];

function StepRow({
  step,
  index,
  isLast,
}: {
  step: (typeof steps)[0];
  index: number;
  isLast: boolean;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <div ref={ref} className="relative">
      {/* Top divider — animated */}
      <motion.div
        initial={{ scaleX: 0 }}
        animate={inView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-0 left-0 right-0 h-px bg-white/6 origin-left"
      />

      <div className="grid grid-cols-[80px_1fr] md:grid-cols-[200px_1fr_260px] gap-0 items-center py-12 md:py-14">
        {/* Left col: number */}
        <div className="relative flex flex-col justify-center">
          {/* Giant watermark number */}
          <span
            className="absolute -left-2 top-1/2 -translate-y-1/2 font-black leading-none select-none pointer-events-none"
            style={{
              fontSize: "clamp(70px, 12vw, 160px)",
              color: "rgba(255,255,255,0.025)",
              letterSpacing: "-0.06em",
            }}
          >
            {step.num}
          </span>

          {/* Visible step identifier */}
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.55, delay: 0.1 + index * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex flex-col gap-1.5"
          >
            <span className="text-[#FF5C28] font-black text-xs tracking-[0.25em] tabular-nums">
              {step.num}
            </span>
            <span className="text-white/18 text-[10px] uppercase tracking-widest">{step.duration}</span>
          </motion.div>
        </div>

        {/* Center col: title + description */}
        <div className="pl-4 md:pl-8 pr-4 md:pr-14">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.15 + index * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="font-black leading-[1.05] tracking-[-0.03em] text-white mb-4 whitespace-pre-line"
            style={{ fontSize: "clamp(24px, 3.2vw, 44px)" }}
          >
            {step.title}
          </motion.h3>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.22 + index * 0.06 }}
            className="text-white/35 text-sm leading-relaxed max-w-lg"
          >
            {step.description}
          </motion.p>
        </div>

        {/* Right col: keyword tags — desktop only */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.32 + index * 0.06 }}
          className="hidden md:flex flex-wrap gap-2 content-start"
        >
          {step.detail.split(" · ").map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-semibold tracking-wide text-white/22 border border-white/7 rounded-full px-3 py-1"
            >
              {tag}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Closing divider on last row */}
      {isLast && (
        <motion.div
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-0 left-0 right-0 h-px bg-white/6 origin-left"
        />
      )}
    </div>
  );
}

export default function Process() {
  const headerRef = useRef(null);
  const inView = useInView(headerRef, { once: true, margin: "-80px" });

  return (
    <section id="process" className="py-32 px-6 relative overflow-hidden">
      {/* Background giant word */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
        <span
          className="font-black text-white/[0.012] tracking-tighter leading-none"
          style={{ fontSize: "28vw" }}
        >
          HOW
        </span>
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div ref={headerRef} className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          >
            <div>
              <span className="text-[#FF5C28] text-[10px] font-bold tracking-[0.3em] uppercase mb-4 block">
                How it works
              </span>
              <h2
                className="font-black tracking-[-0.04em] leading-tight text-white"
                style={{ fontSize: "clamp(40px, 6vw, 88px)" }}
              >
                {inView && <SplitText text="Audit to booked" delay={0.1} />}
                <br />
                {inView && (
                  <SplitText text="jobs in 30 days." delay={0.3} className="gradient-text" />
                )}
              </h2>
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-white/20 text-sm font-light italic max-w-xs leading-relaxed hidden md:block"
            >
              No fluff. No retainers-for-nothing.
              <br />A systematic path from zero to dominant.
            </motion.p>
          </motion.div>
        </div>

        {/* Steps as editorial rows */}
        <div>
          {steps.map((step, i) => (
            <StepRow
              key={step.num}
              step={step}
              index={i}
              isLast={i === steps.length - 1}
            />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-14 flex items-center gap-6"
        >
          <a
            href="#contact"
            className="inline-flex items-center gap-2.5 bg-[#FF5C28] text-white font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-[#e64f20] transition-colors hover:shadow-[0_0_30px_rgba(255,92,40,0.35)]"
          >
            Start your audit
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1 7h12M7 1l6 6-6 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <span className="text-white/25 text-sm">Free. No commitment.</span>
        </motion.div>
      </div>
    </section>
  );
}
