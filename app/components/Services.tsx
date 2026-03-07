"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Search, MousePointerClick, Globe, Share2, ArrowRight, ChevronDown } from "lucide-react";

const services = [
  {
    code: "S-01",
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
    result: "Avg. 3× more organic traffic in 90 days",
  },
  {
    code: "S-02",
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
    result: "Avg. 6.8× ROAS across client accounts",
  },
  {
    code: "S-03",
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
    result: "Avg. 4.1× more leads from existing traffic",
  },
  {
    code: "S-04",
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
    result: "Avg. 2.3× increase in brand search volume",
  },
];

export default function Services() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [active, setActive] = useState<number | null>(0);

  return (
    <section
      id="services"
      ref={ref}
      className="py-32 px-6 relative overflow-hidden"
      style={{ background: "#0E0B07" }}
    >
      {/* Warm glow */}
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          width: 500, height: 500,
          borderRadius: "50%",
          background: "rgba(201,168,76,0.03)",
          filter: "blur(120px)",
        }}
      />

      <div className="max-w-5xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-16"
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
            [ EXHIBIT 03 // SURVIVAL TREATMENTS ]
          </span>
          <h2
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(30px, 5vw, 68px)",
              color: "#F2E8D5",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            Four treatments.
            <br />
            <span className="gradient-text">One survival protocol.</span>
          </h2>
        </motion.div>

        {/* Specimen record accordion */}
        <div style={{ borderTop: "1px solid rgba(201,168,76,0.15)" }}>
          {services.map((svc, i) => {
            const Icon = svc.icon;
            const isActive = active === i;

            return (
              <motion.div
                key={svc.code}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.08 }}
                style={{ borderBottom: "1px solid rgba(201,168,76,0.1)" }}
              >
                <button
                  onClick={() => setActive(isActive ? null : i)}
                  className="w-full text-left transition-all duration-300"
                  style={{
                    background: isActive ? "rgba(201,168,76,0.04)" : "transparent",
                    padding: 0,
                  }}
                  data-cursor-hover
                >
                  {/* Row header */}
                  <div className="flex items-center gap-5 px-0 py-6">
                    {/* Specimen code */}
                    <span
                      className="shrink-0 w-14 text-right"
                      style={{
                        fontFamily: '"SF Mono","Fira Code",monospace',
                        fontSize: "clamp(28px, 4.5vw, 64px)",
                        color: isActive ? "rgba(201,168,76,0.4)" : "rgba(242,232,213,0.07)",
                        lineHeight: 1,
                        letterSpacing: "-0.03em",
                        transition: "color 0.3s",
                      }}
                    >
                      {svc.code}
                    </span>

                    {/* Icon */}
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 shrink-0"
                      style={{
                        background: isActive ? "rgba(139,92,246,0.12)" : "rgba(242,232,213,0.04)",
                        border: `1px solid ${isActive ? "rgba(139,92,246,0.25)" : "rgba(242,232,213,0.06)"}`,
                      }}
                    >
                      <Icon
                        size={15}
                        style={{ color: isActive ? "#8B5CF6" : "rgba(242,232,213,0.35)", transition: "color 0.3s" }}
                      />
                    </div>

                    {/* Title */}
                    <div className="flex-1 min-w-0">
                      <div
                        className="transition-colors duration-300"
                        style={{
                          fontFamily: "'Playfair Display', Georgia, serif",
                          fontSize: "clamp(18px, 2.5vw, 30px)",
                          color: isActive ? "#F2E8D5" : "rgba(242,232,213,0.8)",
                          lineHeight: 1.2,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {svc.title}
                      </div>
                      <div
                        className="mt-0.5"
                        style={{
                          fontFamily: '"SF Mono","Fira Code",monospace',
                          fontSize: 9,
                          letterSpacing: "0.14em",
                          color: isActive ? "rgba(201,168,76,0.5)" : "rgba(242,232,213,0.25)",
                          textTransform: "uppercase",
                          transition: "color 0.3s",
                        }}
                      >
                        {svc.tag}
                      </div>
                    </div>

                    {/* Result + chevron */}
                    <div className="hidden md:flex items-center gap-6 shrink-0">
                      <span
                        className="text-sm font-semibold transition-colors duration-300"
                        style={{ color: isActive ? "rgba(201,168,76,0.7)" : "rgba(242,232,213,0.18)" }}
                      >
                        {svc.result}
                      </span>
                      <motion.div
                        animate={{ rotate: isActive ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown size={15} style={{ color: "rgba(242,232,213,0.25)" }} />
                      </motion.div>
                    </div>
                  </div>

                  {/* Expandable specimen record */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                        className="overflow-hidden"
                      >
                        <div
                          className="ml-[76px] mb-7 p-5"
                          style={{
                            background: "#181410",
                            border: "1px solid rgba(201,168,76,0.15)",
                            borderRadius: 6,
                          }}
                        >
                          {/* Specimen header */}
                          <div
                            className="mb-3"
                            style={{
                              fontFamily: '"SF Mono","Fira Code",monospace',
                              fontSize: 9,
                              letterSpacing: "0.15em",
                              color: "rgba(201,168,76,0.4)",
                              textTransform: "uppercase",
                              paddingBottom: 8,
                              borderBottom: "1px solid rgba(201,168,76,0.1)",
                            }}
                          >
                            TREATMENT RECORD // {svc.code}
                          </div>

                          <p
                            className="leading-relaxed mb-5 max-w-lg text-sm"
                            style={{ color: "rgba(242,232,213,0.45)" }}
                          >
                            {svc.description}
                          </p>
                          <div className="grid sm:grid-cols-2 gap-2 mb-5">
                            {svc.bullets.map((b) => (
                              <div key={b} className="flex items-start gap-2.5">
                                <span style={{ color: "rgba(201,168,76,0.4)", fontSize: 12, marginTop: 1 }}>—</span>
                                <span className="text-sm" style={{ color: "rgba(242,232,213,0.5)" }}>{b}</span>
                              </div>
                            ))}
                          </div>
                          <a
                            href="#contact"
                            className="inline-flex items-center gap-2 text-sm font-semibold transition-all duration-200 hover:gap-3"
                            style={{ color: "#8B5CF6" }}
                          >
                            Start this treatment <ArrowRight size={13} />
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
