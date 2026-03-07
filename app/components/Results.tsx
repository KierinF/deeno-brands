"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { TrendingUp, Phone, MapPin, ArrowUpRight } from "lucide-react";

const caseStudies = [
  {
    company: "Atlas HVAC",
    location: "Phoenix, AZ",
    industry: "HVAC",
    services: ["SEO", "Google Ads"],
    before: { calls: "12/mo", cpl: "$340", rank: "Page 3" },
    after: { calls: "94/mo", cpl: "$48", rank: "#1 Map Pack" },
    highlight: "683% increase in monthly calls",
    color: "from-blue-500/10 to-transparent",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  {
    company: "ProPlumb Co.",
    location: "Dallas, TX",
    industry: "Plumbing",
    services: ["Website", "Local SEO"],
    before: { calls: "8/mo", cpl: "$0", rank: "Not ranking" },
    after: { calls: "71/mo", cpl: "$62", rank: "Top 3 Local" },
    highlight: "New site + SEO = 788% growth",
    color: "from-purple-500/10 to-transparent",
    badge: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
  {
    company: "RoofCraft Pros",
    location: "Nashville, TN",
    industry: "Roofing",
    services: ["Google Ads", "Social"],
    before: { calls: "22/mo", cpl: "$210", rank: "Paid only" },
    after: { calls: "118/mo", cpl: "$55", rank: "Paid + Organic" },
    highlight: "5.4x lead volume with 74% lower CPL",
    color: "from-orange-500/10 to-transparent",
    badge: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  },
];

export default function Results() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="results" ref={ref} className="py-32 px-6 relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full bg-[#FF5C28]/5 blur-[120px]" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="text-[#FF5C28] text-xs font-semibold tracking-widest uppercase mb-4 block">
            Client results
          </span>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Real numbers.
            <br />
            <span className="gradient-text">Real businesses.</span>
          </h2>
          <p className="text-white/40 mt-4 max-w-lg mx-auto">
            These aren't cherry-picked outliers. This is what happens when
            strategy, execution, and data align.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {caseStudies.map((c, i) => (
            <motion.div
              key={c.company}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.7,
                delay: 0.1 + i * 0.12,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="bg-[#0F0F18] border border-white/5 rounded-2xl p-7 flex flex-col relative overflow-hidden group hover:border-white/10 transition-colors"
            >
              <div
                className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-br ${c.color} pointer-events-none`}
              />

              <div className="relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <h3 className="font-bold text-lg">{c.company}</h3>
                    <div className="flex items-center gap-1 text-white/40 text-xs mt-0.5">
                      <MapPin size={10} />
                      {c.location}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${c.badge}`}
                  >
                    {c.industry}
                  </span>
                </div>

                {/* Services */}
                <div className="flex gap-1.5 mb-6 flex-wrap">
                  {c.services.map((s) => (
                    <span
                      key={s}
                      className="text-xs bg-white/5 text-white/40 px-2.5 py-1 rounded-full"
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Metrics comparison */}
                <div className="bg-[#16161F] rounded-xl p-4 mb-5">
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-white/30 text-xs text-center">Metric</div>
                    <div className="text-white/30 text-xs text-center">Before</div>
                    <div className="text-[#FF5C28] text-xs text-center font-semibold">After</div>
                  </div>
                  <div className="space-y-2">
                    {[
                      ["Calls/mo", c.before.calls, c.after.calls],
                      ["Cost/Lead", c.before.cpl, c.after.cpl],
                      ["Ranking", c.before.rank, c.after.rank],
                    ].map(([label, before, after]) => (
                      <div key={label} className="grid grid-cols-3 gap-2 items-center">
                        <span className="text-white/40 text-xs">{label}</span>
                        <span className="text-white/30 text-xs text-center line-through">
                          {before}
                        </span>
                        <span className="text-white font-semibold text-xs text-center">
                          {after}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Highlight */}
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-[#FF5C28] shrink-0" />
                  <span className="text-white/80 text-sm font-semibold">
                    {c.highlight}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
          >
            Want results like these? Let's talk
            <ArrowUpRight size={14} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
