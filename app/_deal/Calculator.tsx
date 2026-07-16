"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { C, F } from "./theme";
import { wrap, H2, Lede, Reveal } from "./ui";

/* One question: what is a qualified meeting worth to you?
   Two inputs, one number out. Our price is deliberately absent.
   It varies by client, and leaving it off also keeps this from
   turning into an ROI-multiple argument we do not need to have. */

const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  hint,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  format: (v: number) => string;
  hint: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 38 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
        <label style={{ fontFamily: C.mono, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: C.mid }}>
          {label}
        </label>
        <span style={{ fontFamily: C.mono, fontSize: 17, color: C.ink }}>{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: "100%",
          height: 3,
          appearance: "none",
          WebkitAppearance: "none",
          outline: "none",
          cursor: "pointer",
          background: `linear-gradient(to right, ${C.accent} 0%, ${C.accent} ${pct}%, ${C.border} ${pct}%, ${C.border} 100%)`,
        }}
      />
      <div style={{ fontFamily: C.mono, fontSize: 10, color: C.muted, marginTop: 9 }}>{hint}</div>
    </div>
  );
}

export default function Calculator() {
  const [fee, setFee] = useState(75000);
  const [closeRate, setCloseRate] = useState(20);
  const worth = fee / closeRate;

  return (
    <section id="math" style={{ background: C.bgAlt, borderBlock: `1px solid ${C.border}`, padding: "104px 0", scrollMarginTop: 68 }}>
      <div style={wrap}>
        <Reveal>
          <H2 max={780}>What is one qualified meeting worth to you?</H2>
          <Lede>
            Your numbers, not ours. Most firms have never put a figure on it.
          </Lede>
        </Reveal>

        <Reveal delay={0.05}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(300px, 1fr) minmax(300px, 0.9fr)",
              gap: 1,
              marginTop: 44,
              background: C.border,
              border: `1px solid ${C.border}`,
            }}
          >
            <div style={{ background: C.panel, padding: 40 }}>
              <Slider
                label="What one closed deal is worth to you"
                value={fee}
                min={25000}
                max={500000}
                step={5000}
                onChange={setFee}
                format={usd}
                hint="Fee, commission, carry, or the return on a single add-on. Whatever one deal is worth to your firm."
              />
              <Slider
                label="Your close rate on meetings like these"
                value={closeRate}
                min={5}
                max={100}
                step={1}
                onChange={setCloseRate}
                format={(v) => `1 in ${v}`}
                hint="How many of these it takes you to land one deal."
              />
            </div>

            <div
              style={{
                background: C.accent,
                padding: 40,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontFamily: C.mono,
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: C.accentInk,
                  opacity: 0.7,
                  marginBottom: 14,
                }}
              >
                One qualified meeting is worth
              </div>
              <motion.div
                key={Math.round(worth)}
                initial={{ opacity: 0.45, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                style={{
                  fontFamily: F.stack,
                  fontWeight: F.weight,
                  letterSpacing: F.tracking,
                  fontSize: "clamp(44px, 5.4vw, 76px)",
                  lineHeight: 1,
                  color: C.accentInk,
                }}
              >
                {usd(worth)}
              </motion.div>
              <div
                style={{
                  color: C.accentInk,
                  opacity: 0.85,
                  fontSize: 16,
                  lineHeight: 1.6,
                  marginTop: 20,
                  paddingTop: 20,
                  borderTop: "1px solid rgba(255,255,255,0.22)",
                }}
              >
                That is what we put on your calendar. If it does not clear all
                six criteria, you are invoiced{" "}
                <span style={{ fontFamily: C.mono }}>$0</span>.
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
