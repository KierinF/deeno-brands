"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const services = [
  {
    num: "01",
    title: "SEO & Local SEO",
    result: "Rank where your customers search",
    desc: "Dominate Google Maps and organic search for every keyword your customers type. GMB, links, on-page — the works.",
  },
  {
    num: "02",
    title: "Google & Meta Ads",
    result: "Booked jobs, not just clicks",
    desc: "Hyper-targeted LSAs, PPC, and paid social that deliver booked appointments — not vanity metrics.",
  },
  {
    num: "03",
    title: "Website Development",
    result: "Built to convert, not just look good",
    desc: "Custom, mobile-first sites that turn visitors into phone calls. Live within 48 hours.",
  },
  {
    num: "04",
    title: "Branding",
    result: "Look like the obvious choice",
    desc: "Logo, colors, voice, and visual system that make your business look polished and trustworthy before anyone calls.",
  },
  {
    num: "05",
    title: "Growth Operations",
    result: "Systems that run while you work",
    desc: "CRM setup, inbound call routing, scheduling automation, reporting dashboards — the back-end that turns leads into revenue.",
  },
];

export default function Services() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section
      id="services"
      ref={ref}
      style={{ background: "#E5E1D6", paddingTop: 80, paddingBottom: 80 }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: 9,
            letterSpacing: "0.08em",
            color: "rgba(28,25,23,0.35)",
            marginBottom: 48,
          }}
        >
          WHAT WE DO
        </motion.p>

        <div style={{ borderTop: "1px solid rgba(28,25,23,0.12)" }}>
          {services.map((svc, i) => (
            <motion.div
              key={svc.num}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              style={{
                borderBottom: "1px solid rgba(28,25,23,0.12)",
                padding: "28px 0",
                display: "grid",
                gridTemplateColumns: "60px 1fr auto",
                gap: "16px 24px",
                alignItems: "start",
              }}
            >
              {/* Number */}
              <span
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 11,
                  color: "rgba(28,25,23,0.2)",
                  paddingTop: 2,
                }}
              >
                {svc.num}
              </span>

              {/* Title + desc */}
              <div>
                <div
                  style={{
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: "clamp(11px, 1.5vw, 16px)",
                    color: "#1C1917",
                    marginBottom: 10,
                    lineHeight: 1.4,
                  }}
                >
                  {svc.title}
                </div>
                <p style={{ fontSize: 13, color: "#8B7F72", lineHeight: 1.65, maxWidth: 480 }}>
                  {svc.desc}
                </p>
              </div>

              {/* Result */}
              <div
                className="hidden md:block text-right"
                style={{ paddingTop: 4 }}
              >
                <span
                  style={{
                    fontFamily: '"SF Mono","Fira Code",monospace',
                    fontSize: 9,
                    color: "rgba(28,25,23,0.3)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {svc.result}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{ marginTop: 40 }}
        >
          <a
            href="#contact"
            style={{
              fontFamily: '"Press Start 2P", monospace',
              fontSize: 9,
              padding: "14px 24px",
              borderRadius: 9999,
              background: "#8B5CF6",
              color: "#fff",
              border: "none",
              letterSpacing: "0.06em",
              display: "inline-block",
              textDecoration: "none",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#7C3AED")}
            onMouseLeave={e => (e.currentTarget.style.background = "#8B5CF6")}
          >
            LET&apos;S TALK →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
