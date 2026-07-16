"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useInView } from "framer-motion";
import { C, F } from "./theme";
import { wrap, H2, Reveal } from "./ui";

/* Four steps as a timeline. The spine fills as you scroll, so the
   process reads as elapsing rather than as a feature list. The day
   markers answer "when do I see a meeting" without spending a
   sentence on it. */

const STEPS: [string, string, string][] = [
  [
    "Thesis intake",
    "The band, the industry, the geography, and your exclusion list. One call, about forty minutes.",
    "Day 1",
  ],
  [
    "We build the owner list",
    "Sourced against your thesis rather than bought. You see it, and cut from it, before anything sends.",
    "Days 2 to 10",
  ],
  [
    "Approved sequences go out",
    "Email, LinkedIn, and calls, from our infrastructure. Not one message sends before you have signed it off.",
    "Day 11",
  ],
  [
    "Meetings land",
    "On your calendar, clearing all six criteria. Invoiced only then, and only for the ones that count.",
    "Week 3 onward",
  ],
];

function Step({ s, i }: { s: [string, string, string]; i: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-120px" });
  const [title, body, when] = s;

  return (
    <div
      ref={ref}
      style={{
        display: "grid",
        gridTemplateColumns: "128px 44px 1fr",
        alignItems: "start",
        paddingBottom: i === STEPS.length - 1 ? 0 : 54,
      }}
    >
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.4, delay: 0.1 }}
        style={{
          fontFamily: C.mono,
          fontSize: 11,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: C.muted,
          textAlign: "right",
          paddingRight: 22,
          paddingTop: 3,
        }}
      >
        {when}
      </motion.div>

      <div style={{ display: "flex", justifyContent: "center", position: "relative" }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ duration: 0.35, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          style={{
            width: 13,
            height: 13,
            borderRadius: "50%",
            background: C.bgAlt,
            border: `2.5px solid ${C.accent}`,
            marginTop: 4,
            zIndex: 2,
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.45, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        style={{ paddingLeft: 8 }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
          <span style={{ fontFamily: C.mono, fontSize: 11, color: C.accent }}>0{i + 1}</span>
          <h3
            style={{
              fontFamily: F.stack,
              fontSize: 21,
              fontWeight: F.weight,
              letterSpacing: F.tracking,
              color: C.ink,
              margin: 0,
            }}
          >
            {title}
          </h3>
        </div>
        <p style={{ color: C.mid, fontSize: 15, lineHeight: 1.6, margin: 0, maxWidth: 460 }}>{body}</p>
      </motion.div>
    </div>
  );
}

export default function Timeline() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.75", "end 0.55"],
  });
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 24, restDelta: 0.001 });

  return (
    <section style={{ background: C.bgAlt, borderBlock: `1px solid ${C.border}`, padding: "104px 0" }}>
      <div style={wrap}>
        <Reveal>
          <H2>Four steps.</H2>
        </Reveal>

        <div ref={ref} style={{ position: "relative", marginTop: 48 }}>
          <div style={{ position: "absolute", left: 149, top: 8, bottom: 8, width: 2, background: C.border }} />
          <motion.div
            style={{
              position: "absolute",
              left: 149,
              top: 8,
              bottom: 8,
              width: 2,
              background: C.accent,
              transformOrigin: "top",
              scaleY,
            }}
          />
          {STEPS.map((s, i) => (
            <Step key={s[0]} s={s} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
