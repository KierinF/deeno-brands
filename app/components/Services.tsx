"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import {
  Search,
  MousePointerClick,
  Globe,
  Share2,
  ChevronRight,
} from "lucide-react";

const services = [
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
];

export default function Services() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [active, setActive] = useState(0);

  const s = services[active];
  const Icon = s.icon;

  return (
    <section id="services" ref={ref} className="py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-14"
        >
          <span className="text-[#FF5C28] text-xs font-semibold tracking-widest uppercase mb-4 block">
            What we do
          </span>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight max-w-2xl">
            Every channel.
            <br />
            <span className="gradient-text">One unified strategy.</span>
          </h2>
        </motion.div>

        <div className="grid lg:grid-cols-[280px_1fr] gap-6">
          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="flex lg:flex-col gap-2"
          >
            {services.map((svc, i) => {
              const SvcIcon = svc.icon;
              return (
                <button
                  key={svc.title}
                  onClick={() => setActive(i)}
                  className={`w-full text-left px-4 py-4 rounded-xl border transition-all duration-200 group ${
                    active === i
                      ? "bg-[#FF5C28]/10 border-[#FF5C28]/30 text-white"
                      : "bg-[#0F0F18] border-white/5 text-white/40 hover:text-white/70 hover:border-white/10"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <SvcIcon
                      size={16}
                      className={
                        active === i ? "text-[#FF5C28]" : "text-current"
                      }
                    />
                    <span className="font-semibold text-sm hidden lg:block">
                      {svc.title}
                    </span>
                    <span className="font-semibold text-xs lg:hidden">
                      {svc.title.split(" ")[0]}
                    </span>
                  </div>
                </button>
              );
            })}
          </motion.div>

          {/* Content panel */}
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#0F0F18] border border-white/5 rounded-2xl p-8 lg:p-10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#FF5C28]/5 blur-[60px] pointer-events-none" />

            <div className="relative">
              <div className="inline-flex items-center gap-1.5 bg-[#FF5C28]/10 border border-[#FF5C28]/20 rounded-full px-3 py-1 mb-5">
                <span className="text-[#FF5C28] text-xs font-semibold">
                  {s.tag}
                </span>
              </div>

              <h3 className="text-2xl md:text-3xl font-black mb-4">{s.title}</h3>
              <p className="text-white/50 leading-relaxed mb-8 max-w-lg">
                {s.description}
              </p>

              <div className="grid sm:grid-cols-2 gap-3 mb-8">
                {s.bullets.map((b) => (
                  <div key={b} className="flex items-start gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#FF5C28] mt-2 shrink-0" />
                    <span className="text-white/60 text-sm">{b}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/5 pt-6 flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 text-sm font-semibold">
                    {s.result}
                  </span>
                </div>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-1.5 text-[#FF5C28] text-sm font-semibold hover:gap-2.5 transition-all"
                >
                  Start this service <ChevronRight size={14} />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
