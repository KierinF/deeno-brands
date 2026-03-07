"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

const benefits = [
  {
    title: "Direct access to Kierin",
    detail: "No account managers, no handoffs. You work directly with the founder.",
  },
  {
    title: "Founding rate locked for 12 months",
    detail: "Early clients get our best pricing, frozen for a full year. Guaranteed in writing.",
  },
  {
    title: "Week-1 onboarding, results tracked from day one",
    detail: "Campaigns live within 7 days. Full tracking stack installed before anything runs.",
  },
  {
    title: "First-mover advantage in your market",
    detail: "We take one client per trade per city. Your competitor can't come in once you're in.",
  },
];

export default function EarlyAccess() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="early-access" ref={ref} className="py-32 px-6 relative overflow-hidden" style={{ background: "#181410" }}>
      {/* Warm glow */}
      <div
        className="absolute bottom-0 right-0 pointer-events-none"
        style={{
          width: 600, height: 600,
          borderRadius: "50%",
          background: "rgba(139,92,246,0.04)",
          filter: "blur(150px)",
          transform: "translate(33%, 33%)",
        }}
      />

      <div className="max-w-6xl mx-auto relative">
        <div className="grid lg:grid-cols-[1fr_340px] gap-16 lg:gap-20 items-start">
          {/* Left column */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6 }}
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
                [ EXHIBIT 06 // FOUNDING COHORT ]
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mb-8"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(34px, 5vw, 72px)",
                color: "#F2E8D5",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}
            >
              Join the living.
              <br />
              <span className="gradient-text">Before it&apos;s too late.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="leading-relaxed mb-14 max-w-lg text-base"
              style={{ color: "rgba(242,232,213,0.4)" }}
            >
              We&apos;re selectively documenting the first businesses that chose to evolve.
              One client per trade per city — the window for your market is open now,
              and may not be for long.
            </motion.p>

            {/* Benefits list */}
            <div className="space-y-7 mb-14">
              {benefits.map((b, i) => (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, x: -16 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.35 + i * 0.08 }}
                  className="flex items-start gap-5 group"
                >
                  <span
                    style={{ color: "#C9A84C", fontSize: 14, flexShrink: 0, marginTop: 2 }}
                    className="group-hover:translate-x-0.5 transition-transform duration-200"
                  >
                    →
                  </span>
                  <div>
                    <div
                      className="mb-1"
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: 16,
                        color: "#F2E8D5",
                      }}
                    >
                      {b.title}
                    </div>
                    <div className="text-sm leading-relaxed" style={{ color: "rgba(242,232,213,0.35)" }}>
                      {b.detail}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.72 }}
            >
              <a
                href="#contact"
                className="inline-flex items-center gap-3 font-bold text-sm group"
                style={{ color: "#F2E8D5" }}
              >
                <span
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-colors group-hover:opacity-80"
                  style={{ background: "#8B5CF6" }}
                >
                  <ArrowRight size={15} />
                </span>
                Apply for a founding spot
              </a>
            </motion.div>
          </div>

          {/* Right column — typographic */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:flex items-center justify-center relative"
          >
            <div className="relative h-[480px] flex items-center justify-center">
              {/* FOUNDING vertical text */}
              <span
                className="select-none leading-none"
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: "clamp(55px, 7vw, 100px)",
                  color: "rgba(201,168,76,0.06)",
                  writingMode: "vertical-rl",
                  textOrientation: "mixed",
                  transform: "rotate(180deg)",
                  letterSpacing: "-0.02em",
                }}
              >
                FOUNDING
              </span>

              {/* Gold accent line */}
              <motion.div
                initial={{ scaleY: 0 }}
                animate={inView ? { scaleY: 1 } : {}}
                transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute left-0 top-8 bottom-8 w-px origin-top"
                style={{ background: "rgba(201,168,76,0.3)" }}
              />

              {/* Spot badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="absolute top-0 right-0 w-20 h-20 rounded-full flex items-center justify-center"
                style={{ border: "1px solid rgba(201,168,76,0.25)" }}
              >
                <div className="text-center">
                  <div
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: 22,
                      color: "#C9A84C",
                      lineHeight: 1,
                    }}
                  >
                    1
                  </div>
                  <div
                    style={{
                      fontFamily: '"SF Mono","Fira Code",monospace',
                      fontSize: 7,
                      letterSpacing: "0.15em",
                      color: "rgba(201,168,76,0.4)",
                      textTransform: "uppercase",
                      marginTop: 3,
                    }}
                  >
                    per city
                  </div>
                </div>
              </motion.div>

              {/* Trade badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.85 }}
                className="absolute bottom-6 right-0 w-20 h-20 rounded-full flex items-center justify-center"
                style={{ border: "1px solid rgba(242,232,213,0.08)" }}
              >
                <div className="text-center">
                  <div
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: 22,
                      color: "rgba(242,232,213,0.4)",
                      lineHeight: 1,
                    }}
                  >
                    1
                  </div>
                  <div
                    style={{
                      fontFamily: '"SF Mono","Fira Code",monospace',
                      fontSize: 7,
                      letterSpacing: "0.15em",
                      color: "rgba(242,232,213,0.2)",
                      textTransform: "uppercase",
                      marginTop: 3,
                    }}
                  >
                    per trade
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
