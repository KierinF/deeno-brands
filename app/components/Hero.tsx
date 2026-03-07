"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Marquee from "./Marquee";

const industryFacts = [
  "70% of homeowners search online before calling",
  "LSAs convert 2.5× higher than standard PPC",
  "Phone leads = 10–15× more revenue than web forms",
  "57% won't call a business under 4 stars",
  "#1 ranked businesses capture 33% of all clicks",
  "Local search drives $1.4T in consumer spending annually",
];

const tradeRows = [
  "HVAC Competitors",
  "Plumbing Rivals",
  "Roofing Opponents",
  "Electrical Companies",
  "Landscaping Businesses",
];

function FossilSkeleton() {
  return (
    <svg
      viewBox="0 0 340 380"
      fill="none"
      stroke="rgba(201,168,76,0.1)"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
      aria-hidden="true"
    >
      {/* Skull */}
      <ellipse cx="270" cy="58" rx="38" ry="26" />
      <circle cx="282" cy="52" r="7" />
      {/* Upper jaw */}
      <path d="M290 72 Q310 80 318 76 Q314 84 308 83 Q302 83 295 80" />
      {/* Lower jaw */}
      <path d="M262 80 Q280 90 290 88 Q294 96 285 98 Q274 98 262 88 Z" />
      {/* Teeth */}
      <path d="M300 77 L302 86 M306 76 L307 85 M311 74 L312 83" />
      {/* Neck */}
      <path d="M238 66 Q220 80 210 95" />
      {/* Spine */}
      <path d="M210 95 Q195 118 185 140 Q175 165 170 190 Q165 215 162 240" />
      {/* Vertebrae spikes */}
      <line x1="210" y1="95"  x2="202" y2="85" />
      <line x1="205" y1="108" x2="197" y2="98" />
      <line x1="200" y1="121" x2="192" y2="111" />
      <line x1="195" y1="134" x2="187" y2="124" />
      <line x1="190" y1="147" x2="182" y2="137" />
      <line x1="185" y1="160" x2="177" y2="150" />
      <line x1="181" y1="173" x2="173" y2="163" />
      <line x1="178" y1="186" x2="170" y2="176" />
      <line x1="175" y1="199" x2="167" y2="189" />
      <line x1="172" y1="212" x2="164" y2="202" />
      {/* Ribs */}
      <path d="M205 110 Q185 120 175 135 Q170 148 182 155 Q195 158 208 148" />
      <path d="M200 125 Q178 136 168 150 Q163 162 176 168 Q190 170 204 160" />
      <path d="M196 142 Q172 152 163 166 Q158 178 172 182 Q187 184 200 174" />
      <path d="M193 158 Q169 168 161 181 Q156 193 171 196 Q186 198 197 188" />
      {/* Tail */}
      <path d="M162 240 Q150 270 140 295 Q130 320 125 340 Q122 355 118 365" />
      {/* Hip */}
      <ellipse cx="168" cy="240" rx="22" ry="14" />
      {/* Front arm */}
      <path d="M205 135 Q220 155 225 170 Q228 180 222 185" />
      <path d="M222 185 Q228 192 224 198 M222 185 Q218 193 215 198 M222 185 Q216 190 212 195" />
      {/* Hind leg right */}
      <path d="M176 252 Q195 270 205 295 Q212 315 208 335" />
      <path d="M208 335 Q218 345 222 355 M208 335 Q212 347 210 358 M208 335 Q204 347 200 358" />
      {/* Hind leg left */}
      <path d="M158 252 Q140 272 132 298 Q126 320 128 340" />
      <path d="M128 340 Q138 350 142 360 M128 340 Q130 352 128 362 M128 340 Q122 350 118 360" />
      {/* Shoulder blade */}
      <path d="M205 110 Q215 102 222 108 Q218 118 210 120" />
    </svg>
  );
}

export default function Hero() {
  const [tradeIdx, setTradeIdx] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setTradeIdx(i => (i + 1) % tradeRows.length), 2800);
    return () => clearInterval(id);
  }, []);

  function openTerminal() {
    window.dispatchEvent(new CustomEvent("deeno:openTerminal"));
  }

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden pt-20 pb-0">
      {/* Warm ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute"
          style={{
            top: "5%", left: "10%",
            width: 700, height: 600,
            borderRadius: "50%",
            background: "rgba(139,92,246,0.04)",
            filter: "blur(140px)",
          }}
        />
        <div
          className="absolute"
          style={{
            top: "20%", right: "0%",
            width: 500, height: 500,
            borderRadius: "50%",
            background: "rgba(201,168,76,0.03)",
            filter: "blur(120px)",
          }}
        />
        <div className="absolute inset-0 gold-grid" />
      </div>

      {/* Fossil skeleton watermark */}
      <div
        className="absolute right-0 top-14 w-[360px] h-[400px] pointer-events-none select-none hidden lg:block"
      >
        <FossilSkeleton />
      </div>

      {/* Specimen label */}
      <div
        className="absolute top-24 right-6 pointer-events-none hidden xl:block"
        style={{
          fontFamily: '"SF Mono","Fira Code",monospace',
          fontSize: 9,
          letterSpacing: "0.16em",
          color: "rgba(201,168,76,0.2)",
          textTransform: "uppercase",
          lineHeight: 1.9,
        }}
      >
        SPECIMEN DB-001<br />
        Tyrannosaurus Marketingus<br />
        EXTINCT: ~PRESENT DAY
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full flex-1 flex flex-col justify-center">
        {/* Exhibit label */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10"
        >
          <span
            style={{
              fontFamily: '"SF Mono","Fira Code",monospace',
              fontSize: 10,
              letterSpacing: "0.2em",
              color: "rgba(201,168,76,0.65)",
              textTransform: "uppercase",
            }}
          >
            [ FIELD REPORT 001 // 2025 MARKET SURVEY ]
          </span>
        </motion.div>

        {/* Main headline */}
        <h1 className="mb-8" style={{ maxWidth: 740 }}>
          <motion.span
            className="block"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(38px, 7vw, 102px)",
              color: "#F2E8D5",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
            }}
          >
            67 million years ago,
          </motion.span>
          <motion.span
            className="block"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.33, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(38px, 7vw, 102px)",
              color: "rgba(242,232,213,0.22)",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
            }}
          >
            failure to adapt
          </motion.span>
          <motion.span
            className="block"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.46, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(38px, 7vw, 102px)",
              color: "#F2E8D5",
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
            }}
          >
            caused extinction.
          </motion.span>
        </h1>

        {/* Cycling trade line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mb-3"
          style={{ minHeight: 36 }}
        >
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(15px, 2vw, 26px)",
              color: "rgba(242,232,213,0.45)",
              fontStyle: "italic",
            }}
          >
            Your{" "}
          </span>
          {mounted && (
            <span style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={tradeIdx}
                  className="inline-block gradient-text"
                  initial={{ y: "100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "-100%", opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    fontFamily: "'Playfair Display', Georgia, serif",
                    fontSize: "clamp(15px, 2vw, 26px)",
                    fontStyle: "italic",
                  }}
                >
                  {tradeRows[tradeIdx]}
                </motion.span>
              </AnimatePresence>
            </span>
          )}
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "clamp(15px, 2vw, 26px)",
              color: "rgba(242,232,213,0.45)",
              fontStyle: "italic",
            }}
          >
            {" "}are making the same mistake.
          </span>
        </motion.div>

        {/* Sub line */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: "clamp(13px, 1.5vw, 20px)",
            color: "#8B5CF6",
            fontStyle: "italic",
            marginBottom: 40,
          }}
        >
          Deeno helps you evolve.
        </motion.p>

        {/* Gold rule */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, delay: 0.95, ease: [0.16, 1, 0.3, 1] }}
          className="origin-left mb-10"
          style={{ height: 1, background: "rgba(201,168,76,0.28)", maxWidth: 480 }}
        />

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05, duration: 0.6 }}
          className="flex flex-row gap-4 items-center mb-14 flex-wrap"
        >
          <button
            onClick={openTerminal}
            className="group inline-flex items-center gap-2.5 font-bold px-7 py-3.5 rounded-xl text-sm transition-all duration-200"
            style={{
              background: "#8B5CF6",
              color: "#fff",
              letterSpacing: "0.04em",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "#7C3AED";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 40px rgba(139,92,246,0.45)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "#8B5CF6";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
            }}
            data-cursor-hover
          >
            ASSESS MY EXTINCTION RISK
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="group-hover:translate-x-0.5 transition-transform">
              <path d="M1 7h12M7 1l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <a
            href="#proof"
            className="text-sm font-medium transition-colors"
            style={{ color: "rgba(242,232,213,0.32)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#F2E8D5")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(242,232,213,0.32)")}
          >
            See the evidence →
          </a>
        </motion.div>

        {/* Small field data row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="flex flex-wrap gap-8 pb-20"
        >
          {[
            { n: "70%", l: "homeowners search before calling" },
            { n: "2.5×", l: "higher LSA conversion rate" },
            { n: "15×", l: "more revenue from phone leads" },
          ].map(s => (
            <div key={s.l} className="flex flex-col">
              <span
                style={{
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 24,
                  color: "#F2E8D5",
                  lineHeight: 1,
                  letterSpacing: "-0.02em",
                }}
              >
                {s.n}
              </span>
              <span style={{ color: "rgba(242,232,213,0.3)", fontSize: 11, marginTop: 4 }}>{s.l}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Marquee strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.35, duration: 0.7 }}
        className="relative z-10"
        style={{ borderTop: "1px solid rgba(201,168,76,0.1)", background: "#181410" }}
      >
        <div className="py-3.5">
          <Marquee duration={38}>
            {industryFacts.map((w) => (
              <span key={w} className="inline-flex items-center gap-3 px-8 text-xs">
                <span className="w-1 h-1 rounded-full shrink-0" style={{ background: "#C9A84C", opacity: 0.45 }} />
                <span style={{ color: "rgba(242,232,213,0.28)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 600 }}>
                  {w}
                </span>
              </span>
            ))}
          </Marquee>
        </div>
      </motion.div>
    </section>
  );
}
