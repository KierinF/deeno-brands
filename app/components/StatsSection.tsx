"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import CountUp from "./CountUp";

const guarantees = [
  { to: 30, suffix: "", label: "days to your first qualified lead", sub: "or we adjust, no charge" },
  { to: 100, suffix: "%", label: "asset ownership — your site, your accounts", sub: "always yours, always accessible" },
  { to: 90, suffix: "%", label: "of clients see positive ROI within 90 days", sub: "based on tracked campaigns" },
];

export default function StatsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="stats"
      ref={ref}
      style={{ background: "#EDEAE0", paddingTop: 80, paddingBottom: 80 }}
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Section label */}
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
          THE PROMISE
        </motion.p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
            background: "rgba(28,25,23,0.1)",
          }}
        >
          {guarantees.map((g, i) => (
            <motion.div
              key={g.label}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              style={{
                background: "#EDEAE0",
                padding: "clamp(24px, 4vw, 48px) clamp(20px, 3vw, 40px)",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: "clamp(32px, 6vw, 80px)",
                  color: i === 0 ? "#8B5CF6" : "#1C1917",
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                  marginBottom: 16,
                }}
              >
                {inView ? <CountUp to={g.to} suffix={g.suffix} duration={2.2} /> : `0${g.suffix}`}
              </span>
              <span style={{ fontSize: 13, color: "rgba(28,25,23,0.5)", lineHeight: 1.5, marginBottom: 6 }}>
                {g.label}
              </span>
              <span style={{ fontFamily: '"SF Mono","Fira Code",monospace', fontSize: 9, color: "rgba(28,25,23,0.25)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {g.sub}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
