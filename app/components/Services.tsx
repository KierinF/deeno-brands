"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Search, MousePointerClick, Globe, Share2, ArrowRight, ChevronDown } from "lucide-react";
import SplitText from "./SplitText";

const services = [
  {
    num: "01",
    icon: Search,
    tag: "Local Dominance",
    title: "SEO & Local SEO",
    description:
      "Rank #1 on Google Maps and organic search for every high-intent keyword your customers are searching. We handle on-page, technical SEO, link building, and GMB optimization.",
    bullets: [
      "Google Business Profile optimization",
      "Local citation building & NAP consistency",
      "Keyword research for buyer-intent terms",
      "Monthly reporting with rank tracking",
    ],
    result: "Avg. 3x more organic traffic in 90 days",
    color: "#3B82F6",
  },
  {
    num: "02",
    icon: MousePointerClick,
    tag: "Immediate Leads",
    title: "Google & Meta Ads",
    description:
      "Stop burning budget on broad campaigns. We build hyper-targeted PPC and paid social ads that deliver booked appointments — not just clicks.",
    bullets: [
      "Google Local Services Ads management",
      "Search & display campaign strategy",
      "Facebook/Instagram retargeting",
      "Conversion tracking & CPA optimization",
    ],
    result: "Avg. 6.8x ROAS across client accounts",
    color: "#8B5CF6",
  },
  {
    num: "03",
    icon: Globe,
    tag: "Convert Visitors",
    title: "Website Design",
    description:
      "Your website is your #1 salesperson. We design fast, mobile-first sites built to convert visitors into phone calls and form fills — within 24–48 hours of launch.",
    bullets: [
      "Custom design (no templates)",
      "Core Web Vitals optimized",
      "Click-to-call, lead forms, chat widget",
      "A/B tested landing pages",
    ],
    result: "Avg. 4.1x more leads from existing traffic",
    color: "#8B5CF6",
  },
  {
    num: "04",
    icon: Share2,
    tag: "Brand Authority",
    title: "Social Media Marketing",
    description:
      "Turn your finished jobs into a powerful content machine. We create, schedule, and manage content that builds trust with homeowners before they ever call.",
    bullets: [
      "Facebook, Instagram & TikTok management",
      "Before/after project content creation",
      "Review generation campaigns",
      "Community engagement & reputation",
    ],
    result: "Avg. 2.3x increase in brand search volume",
    color: "#EC4899",
  },
];

export default function Services() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [active, setActive] = useState<number | null>(0);

  return (
    <section id="services" ref={ref} className="py-32 px-6 relative overflow-hidden">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#8B5CF6]/4 blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-16"
        >
          <span className="text-[#8B5CF6] text-xs font-semibold tracking-widest uppercase mb-4 block">
            What we do
          </span>
          <h2 className="text-4xl md:text-6xl font-black tracking-[-0.03em] leading-tight max-w-xl">
            {inView && <SplitText text="Every channel." delay={0.1} />}
            <br />
            {inView && <SplitText text="One strategy." delay={0.3} className="gradient-text" />}
          </h2>
        </motion.div>

        {/* Numbered accordion list */}
        <div className="space-y-px">
          {services.map((svc, i) => {
            const Icon = svc.icon;
            const isActive = active === i;

            return (
              <motion.div
                key={svc.num}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.08 }}
              >
                <button
                  onClick={() => setActive(isActive ? null : i)}
                  className={`w-full text-left group transition-colors duration-300 ${
                    isActive ? "bg-[#0F0F18]" : "hover:bg-white/2"
                  } rounded-2xl`}
                  data-cursor-hover
                >
                  {/* Row header */}
                  <div className="flex items-center gap-6 px-6 py-6 border-t border-white/5">
                    {/* Large number */}
                    <span
                      className="text-[clamp(48px,6vw,80px)] font-black leading-none transition-colors duration-300 shrink-0 w-24 text-right"
                      style={{ color: isActive ? svc.color : "rgba(255,255,255,0.07)" }}
                    >
                      {svc.num}
                    </span>

                    {/* Icon + title */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 shrink-0"
                        style={{
                          background: isActive ? `${svc.color}18` : "rgba(255,255,255,0.04)",
                          border: `1px solid ${isActive ? `${svc.color}30` : "rgba(255,255,255,0.06)"}`,
                        }}
                      >
                        <Icon
                          size={16}
                          style={{ color: isActive ? svc.color : "rgba(255,255,255,0.4)" }}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-lg md:text-2xl font-bold text-white/90 group-hover:text-white transition-colors">
                          {svc.title}
                        </div>
                        <div
                          className="text-xs font-semibold mt-0.5 transition-colors duration-300"
                          style={{ color: isActive ? svc.color : "rgba(255,255,255,0.3)" }}
                        >
                          {svc.tag}
                        </div>
                      </div>
                    </div>

                    {/* Result + chevron */}
                    <div className="hidden md:flex items-center gap-6 shrink-0">
                      <span className={`text-sm font-semibold transition-colors duration-300 ${isActive ? "text-emerald-400" : "text-white/20"}`}>
                        {svc.result}
                      </span>
                      <motion.div
                        animate={{ rotate: isActive ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown size={16} className="text-white/30" />
                      </motion.div>
                    </div>
                  </div>

                  {/* Expandable content */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-8 pl-[7rem]">
                          <p className="text-white/50 leading-relaxed mb-6 max-w-lg text-sm md:text-base">
                            {svc.description}
                          </p>
                          <div className="grid sm:grid-cols-2 gap-2.5 mb-6">
                            {svc.bullets.map((b) => (
                              <div key={b} className="flex items-start gap-2.5">
                                <div
                                  className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                                  style={{ background: svc.color }}
                                />
                                <span className="text-white/55 text-sm">{b}</span>
                              </div>
                            ))}
                          </div>
                          <a
                            href="#contact"
                            className="inline-flex items-center gap-2 text-sm font-semibold hover:gap-3 transition-all duration-200"
                            style={{ color: svc.color }}
                          >
                            Start this service <ArrowRight size={14} />
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            );
          })}
          <div className="border-t border-white/5" />
        </div>
      </div>
    </section>
  );
}
