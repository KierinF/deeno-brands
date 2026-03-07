"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ClipboardList, Lightbulb, Rocket, BarChart3 } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: ClipboardList,
    title: "Free Growth Audit",
    description:
      "We dig into your current marketing, competitors, and local market. No fluff — you get a real analysis of what's working, what's broken, and where the money is.",
    duration: "Week 1",
  },
  {
    num: "02",
    icon: Lightbulb,
    title: "Custom Strategy",
    description:
      "We build a 90-day roadmap specific to your trade, market, and goals. Every channel has a purpose. Every dollar has a destination.",
    duration: "Week 1–2",
  },
  {
    num: "03",
    icon: Rocket,
    title: "Launch & Execute",
    description:
      "Our team goes heads-down on building campaigns, optimizing your site, and getting your GMB firing. Most clients see results within 30 days.",
    duration: "Week 2–4",
  },
  {
    num: "04",
    icon: BarChart3,
    title: "Report & Scale",
    description:
      "Monthly calls, transparent dashboards, and data-driven decisions. When something works, we double down. We scale what converts.",
    duration: "Ongoing",
  },
];

export default function Process() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="process" ref={ref} className="py-32 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-20"
        >
          <span className="text-[#FF5C28] text-xs font-semibold tracking-widest uppercase mb-4 block">
            How it works
          </span>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            From audit to
            <br />
            <span className="gradient-text">booked jobs in 30 days.</span>
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line */}
          <div className="absolute left-[28px] lg:left-1/2 top-12 bottom-12 w-px bg-gradient-to-b from-[#FF5C28]/30 via-[#FF5C28]/10 to-transparent hidden sm:block lg:hidden" />

          <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.6,
                    delay: 0.1 + i * 0.12,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="relative"
                >
                  {/* Connector arrow on desktop */}
                  {i < 3 && (
                    <div className="hidden lg:block absolute top-8 right-0 translate-x-1/2 z-10">
                      <div className="w-3 h-px bg-white/10" />
                    </div>
                  )}

                  <div className="bg-[#0F0F18] border border-white/5 rounded-2xl p-6 h-full hover:border-[#FF5C28]/15 transition-colors">
                    {/* Step number + icon */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-12 h-12 rounded-xl bg-[#FF5C28]/10 border border-[#FF5C28]/20 flex items-center justify-center">
                        <Icon size={20} className="text-[#FF5C28]" />
                      </div>
                      <span className="text-white/15 font-black text-2xl">
                        {step.num}
                      </span>
                    </div>

                    {/* Duration badge */}
                    <div className="inline-block bg-white/5 text-white/40 text-xs px-2.5 py-1 rounded-full mb-3">
                      {step.duration}
                    </div>

                    <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                    <p className="text-white/45 text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
