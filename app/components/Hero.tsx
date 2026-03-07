"use client";

import { motion } from "framer-motion";
import { type ReactNode } from "react";

// Pill component — like ToyFight's word bubbles
function Pill({ children, v = "dark" }: { children: ReactNode; v?: "dark" | "purple" | "outline" }) {
  const styles: Record<string, React.CSSProperties> = {
    dark:    { background: "#1C1917", color: "#EDEAE0" },
    purple:  { background: "#8B5CF6", color: "#fff" },
    outline: { background: "transparent", border: "2.5px solid #1C1917", color: "#1C1917" },
  };
  return (
    <span
      className="inline-flex items-center"
      style={{
        fontFamily: '"Press Start 2P", monospace',
        fontSize: "clamp(22px, 4vw, 56px)",
        lineHeight: 1.25,
        padding: "0.35em 0.7em",
        borderRadius: "9999px",
        margin: "4px 6px",
        verticalAlign: "middle",
        ...styles[v],
      }}
    >
      {children}
    </span>
  );
}

// Pixel-art T-Rex SVG — charming, wry, not scary
function PixelDino() {
  const px = 12; // pixel size
  const c = "#1C1917";
  // Grid positions [col, row] of filled pixels (0-indexed, 0,0 = top-left)
  // Rough T-Rex silhouette facing left
  const pixels: [number, number][] = [
    // Head
    [4,0],[5,0],[6,0],[7,0],
    [3,1],[4,1],[5,1],[6,1],[7,1],[8,1],
    [3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[9,2],
    [4,3],[5,3],[6,3],[7,3],[8,3],[9,3],
    // Jaw
    [5,4],[6,4],[7,4],[8,4],[9,4],[10,4],
    [7,5],[8,5],[9,5],[10,5],
    // Eye (white pixel in head)
    // Neck + body
    [3,3],[2,4],[2,5],[2,6],
    [1,5],[1,6],[1,7],[1,8],[1,9],
    [2,7],[2,8],[2,9],[2,10],
    [3,7],[3,8],[3,9],[3,10],
    [4,7],[4,8],[4,9],[4,10],
    [5,7],[5,8],[5,9],
    [6,7],[6,8],
    // Tail
    [0,8],[0,9],[0,10],
    // Upper arm (tiny)
    [3,5],[3,6],
    [4,5],[4,6],
    // Legs
    [2,11],[3,11],
    [2,12],[3,12],
    [1,12],[4,12],
    [1,13],[4,13],
    [5,9],[5,10],
    [5,11],[6,11],
    [5,12],[6,12],
    [4,13],[5,13],[6,13],[7,13],
  ];

  const width = 12 * px;
  const height = 15 * px;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      aria-label="Pixel dinosaur mascot"
    >
      {pixels.map(([col, row]) => (
        <rect
          key={`${col}-${row}`}
          x={col * px}
          y={row * px}
          width={px}
          height={px}
          fill={c}
        />
      ))}
      {/* Eye — cream dot */}
      <rect x={7 * px} y={1 * px} width={px} height={px} fill="#EDEAE0" />
      {/* Eye pupil */}
      <rect x={7 * px + 3} y={1 * px + 3} width={px - 6} height={px - 6} fill="#1C1917" />
    </svg>
  );
}

export default function Hero() {
  function openTerminal() {
    window.dispatchEvent(new CustomEvent("deeno:openTerminal"));
  }

  return (
    <section
      className="relative min-h-screen flex flex-col"
      style={{ background: "#EDEAE0" }}
    >
      {/* Main content — vertically centered */}
      <div
        className="flex-1 flex flex-col items-start justify-center max-w-7xl mx-auto w-full px-6"
        style={{ paddingTop: 80, paddingBottom: 40 }}
      >
        <div className="grid lg:grid-cols-[1fr_280px] gap-10 lg:gap-4 items-center w-full">

          {/* Left: Headline + CTAs */}
          <div>
            {/* Small label */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              style={{
                fontFamily: '"SF Mono","Fira Code",monospace',
                fontSize: 10,
                letterSpacing: "0.18em",
                color: "#8B7F72",
                textTransform: "uppercase",
                marginBottom: 28,
              }}
            >
              Home Services Marketing Agency
            </motion.p>

            {/* Pill-word headline — ToyFight style */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{ lineHeight: 1, marginBottom: 32 }}
            >
              {/* Line 1: "We make your phone" */}
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 0, marginBottom: 6 }}>
                <Pill v="dark">We make your</Pill>
                {" "}
                <span
                  style={{
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: "clamp(22px, 4vw, 56px)",
                    color: "#1C1917",
                    padding: "0.35em 0.3em",
                    display: "inline-block",
                    verticalAlign: "middle",
                  }}
                >
                  phone
                </span>
              </div>

              {/* Line 2: "ring. Not your competitors'." */}
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 0 }}>
                <Pill v="purple">ring.</Pill>
                {" "}
                <span
                  style={{
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: "clamp(14px, 2.2vw, 32px)",
                    color: "rgba(28,25,23,0.3)",
                    padding: "0.35em 0.3em",
                    display: "inline-block",
                    verticalAlign: "middle",
                    lineHeight: 1.4,
                  }}
                >
                  Not your competitors&apos;.
                </span>
              </div>
            </motion.div>

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.5 }}
              style={{
                fontFamily: '"Inter Variable","Inter",sans-serif',
                fontStyle: "italic",
                fontSize: 15,
                color: "#8B7F72",
                marginBottom: 40,
                fontWeight: 300,
              }}
            >
              We&apos;re named after a dinosaur. Our marketing isn&apos;t.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}
            >
              <button
                onClick={openTerminal}
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 9,
                  padding: "14px 24px",
                  borderRadius: 9999,
                  background: "#1C1917",
                  color: "#EDEAE0",
                  border: "none",
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#3D3430")}
                onMouseLeave={e => (e.currentTarget.style.background = "#1C1917")}
                data-cursor-hover
              >
                SCAN YOUR SITE →
              </button>
              <a
                href="#contact"
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 8,
                  padding: "13px 20px",
                  borderRadius: 9999,
                  background: "transparent",
                  color: "rgba(28,25,23,0.45)",
                  border: "1.5px solid rgba(28,25,23,0.15)",
                  letterSpacing: "0.06em",
                  textDecoration: "none",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(28,25,23,0.4)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#1C1917";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(28,25,23,0.15)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "rgba(28,25,23,0.45)";
                }}
              >
                GET IN TOUCH
              </a>
            </motion.div>
          </div>

          {/* Right: Pixel dino */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:flex justify-center items-end"
            style={{ paddingBottom: 16 }}
          >
            <div style={{ position: "relative" }}>
              <PixelDino />
              {/* Wry speech bubble */}
              <div
                style={{
                  position: "absolute",
                  top: -20,
                  right: -110,
                  background: "#8B5CF6",
                  color: "#fff",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 7,
                  lineHeight: 1.6,
                  letterSpacing: "0.05em",
                  maxWidth: 110,
                  whiteSpace: "nowrap",
                }}
              >
                Not me though.
                {/* Tail */}
                <div
                  style={{
                    position: "absolute",
                    bottom: -6,
                    left: 12,
                    width: 0,
                    height: 0,
                    borderLeft: "6px solid transparent",
                    borderRight: "6px solid transparent",
                    borderTop: "6px solid #8B5CF6",
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom stats row — very minimal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          style={{
            display: "flex",
            gap: "clamp(24px, 5vw, 60px)",
            marginTop: 64,
            paddingTop: 24,
            borderTop: "1px solid rgba(28,25,23,0.1)",
            flexWrap: "wrap",
          }}
        >
          {[
            { n: "70%", l: "of homeowners google before calling" },
            { n: "2.5×", l: "LSA vs standard PPC conversion" },
            { n: "15×", l: "more revenue from phone leads" },
          ].map(s => (
            <div key={s.n} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: "clamp(16px, 2.5vw, 28px)",
                  color: "#1C1917",
                  lineHeight: 1,
                }}
              >
                {s.n}
              </span>
              <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#8B7F72" }}>
                {s.l}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
