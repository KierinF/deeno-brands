"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ClipboardList, Lightbulb, Rocket, BarChart3 } from "lucide-react";
import SplitText from "./SplitText";

const steps = [
  {
    num: "01",
    icon: ClipboardList,
    title: "Free Growth Audit",
    description: "We dig into your current marketing, competitors, and local market. You get a real analysis of what's broken and where the money is.",
    duration: "Week 1",
  },
  {
    num: "02",
    icon: Lightbulb,
    title: "Custom Strategy",
    description: "We build a 90-day roadmap specific to your trade, market, and goals. Every channel has a purpose. Every dollar has a destination.",
    duration: "Week 1–2",
  },
  {
    num: "03",
    icon: Rocket,
    title: "Launch & Execute",
    description: "Our team builds campaigns, optimizes your site, and gets your GMB firing. Most clients see leads within 30 days.",
    duration: "Week 2–4",
  },
  {
    num: "04",
    icon: BarChart3,
    title: "Report & Scale",
    description: "Monthly strategy calls, transparent dashboards, data-driven decisions. We scale what converts and cut what doesn't.",
    duration: "Ongoing",
  },
];

export default function Process() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="process" ref={ref} className="py-32 px-6 relative overflow-hidden">
      {/* Background large text watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <span className="text-[20vw] font-black text-white/[0.015] select-none tracking-tighter leading-none">
          PROCESS
        </span>
      </div>

      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <span className="text-[#FF5C28] text-xs font-semibold tracking-widest uppercase mb-4 block">
            How it works
          </span>
          <h2 className="text-4xl md:text-6xl font-black tracking-[-0.03em] leading-tight">
            {inView && <SplitText text="Audit to booked jobs" delay={0.1} />}
            <br />
            {inView && <SplitText text="in 30 days." delay={0.35} className="gradient-text" />}
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-5">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{
                  duration: 0.6,
                  delay: 0.15 + i * 0.12,
                  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                }}
                className="relative group"
              >
                {/* Connector */}
                {i < 3 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={inView ? { scaleX: 1 } : {}}
                    transition={{ delay: 0.5 + i * 0.2, duration: 0.5 }}
                    className="hidden lg:block absolute top-[2.75rem] left-full w-5 h-px bg-gradient-to-r from-[#FF5C28]/40 to-white/10 origin-left z-10"
                  />
                )}

                <div className="bg-[#0F0F18] border border-white/5 rounded-2xl p-6 h-full group-hover:border-[#FF5C28]/15 transition-all duration-300 group-hover:-translate-y-1">
                  {/* Number watermark */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-11 h-11 rounded-xl bg-[#FF5C28]/10 border border-[#FF5C28]/20 flex items-center justify-center">
                      <Icon size={18} className="text-[#FF5C28]" />
                    </div>
                    <span className="text-[#FF5C28]/20 font-black text-4xl leading-none">
                      {step.num}
                    </span>
                  </div>

                  <div className="inline-block bg-white/5 text-white/35 text-xs px-2.5 py-1 rounded-full mb-3">
                    {step.duration}
                  </div>

                  <h3 className="text-base font-bold mb-2 text-white/90">{step.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
