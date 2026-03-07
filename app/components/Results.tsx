"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
} from "framer-motion";
import { MapPin, TrendingUp, ArrowUpRight } from "lucide-react";

const caseStudies = [
  {
    index: "01",
    company: "Atlas HVAC",
    location: "Phoenix, AZ",
    industry: "HVAC",
    services: ["SEO", "Google Ads"],
    before: { calls: "12/mo", cpl: "$340", rank: "Page 3" },
    after: { calls: "94/mo", cpl: "$48", rank: "#1 Map Pack" },
    headline: "+683%",
    subline: "more calls per month",
    tint: "rgba(59,130,246,0.04)",
    accentColor: "#3B82F6",
  },
  {
    index: "02",
    company: "ProPlumb Co.",
    location: "Dallas, TX",
    industry: "Plumbing",
    services: ["Website", "Local SEO"],
    before: { calls: "8/mo", cpl: "—", rank: "Not ranking" },
    after: { calls: "71/mo", cpl: "$62", rank: "Top 3 Local" },
    headline: "+788%",
    subline: "growth in first 6 months",
    tint: "rgba(139,92,246,0.04)",
    accentColor: "#8B5CF6",
  },
  {
    index: "03",
    company: "RoofCraft Pros",
    location: "Nashville, TN",
    industry: "Roofing",
    services: ["Google Ads", "Social"],
    before: { calls: "22/mo", cpl: "$210", rank: "Paid only" },
    after: { calls: "118/mo", cpl: "$55", rank: "Paid + Organic" },
    headline: "5.4x",
    subline: "lead volume, 74% lower CPL",
    tint: "rgba(255,92,40,0.04)",
    accentColor: "#FF5C28",
  },
];

function CaseStudyCard({ c }: { c: typeof caseStudies[0] }) {
  return (
    <div
      className="shrink-0 flex flex-col justify-center px-[8vw] lg:px-[6vw]"
      style={{ width: "90vw", maxWidth: "900px" }}
    >
      {/* Index + industry */}
      <div className="flex items-center gap-4 mb-8">
        <span className="text-white/15 font-black text-sm tracking-widest">{c.index}</span>
        <div className="w-8 h-px bg-white/15" />
        <span className="text-white/30 text-xs tracking-widest uppercase">{c.industry}</span>
        <div className="flex items-center gap-1 text-white/25 text-xs ml-2">
          <MapPin size={10} />
          {c.location}
        </div>
      </div>

      {/* Company name — large */}
      <h3
        className="font-black leading-none tracking-[-0.04em] text-white mb-4"
        style={{ fontSize: "clamp(48px, 8vw, 120px)" }}
      >
        {c.company}
      </h3>

      {/* Headline result */}
      <div className="flex items-baseline gap-4 mb-8">
        <span
          className="font-black leading-none tracking-[-0.04em]"
          style={{ fontSize: "clamp(56px, 9vw, 130px)", color: c.accentColor }}
        >
          {c.headline}
        </span>
        <span className="text-white/40 text-lg font-light italic max-w-xs leading-snug">
          {c.subline}
        </span>
      </div>

      {/* Services */}
      <div className="flex gap-2 mb-10">
        {c.services.map((s) => (
          <span
            key={s}
            className="text-[11px] px-3 py-1 rounded-full border font-semibold tracking-wide"
            style={{ borderColor: `${c.accentColor}30`, color: c.accentColor, background: `${c.accentColor}08` }}
          >
            {s}
          </span>
        ))}
      </div>

      {/* Before / After metrics */}
      <div className="grid grid-cols-3 gap-6 max-w-md">
        {[
          ["Calls/mo", c.before.calls, c.after.calls],
          ["Cost/Lead", c.before.cpl, c.after.cpl],
          ["Ranking", c.before.rank, c.after.rank],
        ].map(([label, before, after]) => (
          <div key={label as string}>
            <div className="text-white/25 text-[10px] uppercase tracking-widest mb-2">{label}</div>
            <div className="text-white/30 text-xs line-through mb-1">{before}</div>
            <div className="text-white font-bold text-sm">{after}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Results() {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef(null);
  const labelInView = useInView(labelRef, { once: true });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Translate the track left as user scrolls
  const x = useTransform(scrollYProgress, [0, 1], ["0vw", "-200vw"]);

  // Active card index for counter
  const activeIndex = useTransform(scrollYProgress, [0, 0.33, 0.66, 1], [0, 1, 2, 2]);

  return (
    <section id="results">
      {/* Section intro — outside the sticky container */}
      <div ref={labelRef} className="px-6 pt-28 pb-12 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={labelInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <span className="text-[#FF5C28] text-[10px] font-bold tracking-[0.3em] uppercase mb-4 block">
            Client results
          </span>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <h2
              className="font-black tracking-[-0.04em] leading-none text-white"
              style={{ fontSize: "clamp(40px, 6vw, 88px)" }}
            >
              Real numbers.
              <br />
              <span className="text-white/25">Real businesses.</span>
            </h2>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 text-white/35 hover:text-white text-sm transition-colors mb-2"
            >
              Want results like these? <ArrowUpRight size={14} />
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={labelInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="h-px bg-white/8 origin-left mt-10"
        />
      </div>

      {/* Horizontal scroll container */}
      <div ref={containerRef} style={{ height: "350vh" }} className="relative">
        <div
          style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}
          className="flex items-center"
        >
          {/* Progress bar along bottom */}
          <motion.div
            className="absolute bottom-0 left-0 h-px bg-[#FF5C28]/40"
            style={{ scaleX: scrollYProgress, transformOrigin: "left" }}
          />

          {/* Slide number indicator — bottom left */}
          <div className="absolute bottom-8 left-6 flex items-center gap-3 z-10">
            <TrendingUp size={14} className="text-[#FF5C28]" />
            <div className="flex gap-2">
              {caseStudies.map((c, i) => (
                <motion.div
                  key={c.index}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: useTransform(
                      scrollYProgress,
                      [i / 3, (i + 0.5) / 3],
                      ["rgba(255,255,255,0.15)", "#FF5C28"]
                    ),
                  }}
                />
              ))}
            </div>
          </div>

          {/* Scroll hint — bottom right */}
          <motion.div
            className="absolute bottom-8 right-6 text-white/20 text-[11px] tracking-widest uppercase"
            initial={{ opacity: 1 }}
            style={{ opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0]) }}
          >
            Scroll to explore →
          </motion.div>

          {/* The scrolling track */}
          <motion.div
            style={{ x, display: "flex", alignItems: "center", height: "100%" }}
          >
            {caseStudies.map((c) => (
              <CaseStudyCard key={c.company} c={c} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
