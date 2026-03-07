"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";

// ─── Pixel Dino (two-color: navy outline + teal fill) ────────────────────────
// Swap this component out with <img src="/dino.png" style={{imageRendering:"pixelated"}} />
// if you drop your own image in public/dino.png

function range(s: number, e: number, r: number): [number, number][] {
  return Array.from({ length: e - s + 1 }, (_, i) => [s + i, r] as [number, number]);
}

const NAVY = "#1E2D4E";
const TEAL = "#72C4A2";

// Dark navy pixels — full silhouette outline
const DARK_PX: [number, number][] = [
  // head crown
  ...range(7, 12, 0),
  // head r1
  ...range(6, 13, 1),
  // head r2-3
  ...range(5, 14, 2), ...range(5, 14, 3),
  // jaw row (beak starts left)
  ...range(3, 14, 4),
  // beak r5 + back-of-head
  ...range(2, 8, 5), ...range(13, 15, 5),
  // beak r6 + neck
  ...range(1, 7, 6), ...range(14, 16, 6),
  // beak bottom + neck
  ...range(2, 6, 7), ...range(15, 17, 7),
  // body start + spine step
  ...range(14, 20, 8), ...range(20, 22, 8),
  ...range(13, 21, 9), ...range(21, 23, 9),
  ...range(12, 22, 10), ...range(22, 24, 10),
  // arm jut out front
  ...range(9, 11, 10),
  ...range(11, 23, 11), ...range(9, 10, 11),
  ...range(10, 22, 12),
  ...range(9, 21, 13),
  // legs
  ...range(10, 12, 14), ...range(14, 16, 14),
  ...range(10, 12, 15), ...range(14, 16, 15),
  ...range(9, 12, 16), ...range(14, 17, 16),
  ...range(8, 13, 17), ...range(14, 19, 17),
  // ground bar
  ...range(6, 20, 18), ...range(6, 20, 19),
];

// Teal fill — interior, 1 pixel inset from outline
const TEAL_PX: [number, number][] = [
  // head inner
  ...range(7, 12, 1),
  ...range(6, 13, 2), ...range(6, 13, 3),
  ...range(4, 13, 4),
  // beak inner
  ...range(3, 7, 5),
  ...range(2, 6, 6),
  ...range(3, 5, 7),
  // body inner
  ...range(15, 21, 8),
  ...range(14, 22, 9),
  ...range(13, 21, 10), [10, 10],  // arm inner
  ...range(12, 22, 11),
  ...range(11, 21, 12),
  ...range(10, 20, 13),
  // legs inner
  [11, 14], [12, 14], [15, 14], [16, 14],
  [11, 15], [12, 15], [15, 15], [16, 15],
  [10, 16], [11, 16], [15, 16], [16, 16],
  ...range(9, 12, 17), ...range(15, 18, 17),
];

// Eye + arm detail (dark, rendered last on top of teal)
const DETAIL_PX: [number, number][] = [
  [8, 2], [9, 2],   // eye (2×1 dark dot)
  [9, 11], [10, 11], // arm/claw detail
];

function PixelDino({ px = 10 }: { px?: number }) {
  const W = 25 * px;
  const H = 20 * px;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" aria-label="Pixel T-Rex">
      {DARK_PX.map(([c, r]) => (
        <rect key={`d-${c}-${r}`} x={c * px} y={r * px} width={px} height={px} fill={NAVY} />
      ))}
      {TEAL_PX.map(([c, r]) => (
        <rect key={`t-${c}-${r}`} x={c * px} y={r * px} width={px} height={px} fill={TEAL} />
      ))}
      {DETAIL_PX.map(([c, r]) => (
        <rect key={`e-${c}-${r}`} x={c * px} y={r * px} width={px} height={px} fill={NAVY} />
      ))}
    </svg>
  );
}

// ─── Cactus obstacle ─────────────────────────────────────────────────────────
function Cactus({ height = 60 }: { height?: number }) {
  return (
    <svg width={28} height={height} viewBox={`0 0 28 ${height}`} fill={NAVY}>
      <rect x={10} y={0} width={8} height={height} />
      <rect x={0} y={Math.floor(height * 0.3)} width={10} height={6} />
      <rect x={0} y={Math.floor(height * 0.15)} width={6} height={Math.floor(height * 0.2)} />
      <rect x={18} y={Math.floor(height * 0.4)} width={10} height={6} />
      <rect x={22} y={Math.floor(height * 0.25)} width={6} height={Math.floor(height * 0.2)} />
    </svg>
  );
}

// ─── Dino Game ────────────────────────────────────────────────────────────────
const GROUND = 88;
const DINO_W = 65;
const DINO_H = 80;
const DINO_X = 60;
const CACTUS_W = 28;
const JUMP_V = -14;
const GRAVITY = 0.55;
const SPEED_START = 5;
const SPEED_INC = 0.0008;

interface CactusObj { id: number; x: number; h: number }

function DinoGame() {
  const [phase, setPhase] = useState<"idle" | "running" | "dead">("idle");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [dinoY, setDinoY] = useState(0);
  const [cacti, setCacti] = useState<CactusObj[]>([]);
  const [containerW, setContainerW] = useState(800);

  const velRef = useRef(0);
  const dinoYRef = useRef(0);
  const cactiRef = useRef<CactusObj[]>([]);
  const scoreRef = useRef(0);
  const frameRef = useRef(0);
  const frameCountRef = useRef(0);
  const speedRef = useRef(SPEED_START);
  const nextCactusRef = useRef(120);
  const phaseRef = useRef<"idle" | "running" | "dead">("idle");
  const containerRef = useRef<HTMLDivElement>(null);
  let idNext = useRef(0);

  useEffect(() => {
    const obs = new ResizeObserver(entries => setContainerW(entries[0].contentRect.width));
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const jump = useCallback(() => {
    if (phaseRef.current === "idle") {
      phaseRef.current = "running";
      setPhase("running");
    }
    if (phaseRef.current === "running" && dinoYRef.current <= 1) {
      velRef.current = JUMP_V;
    }
  }, []);

  const restart = useCallback(() => {
    velRef.current = 0;
    dinoYRef.current = 0;
    cactiRef.current = [];
    scoreRef.current = 0;
    frameCountRef.current = 0;
    speedRef.current = SPEED_START;
    nextCactusRef.current = 120;
    phaseRef.current = "running";
    setDinoY(0); setCacti([]); setScore(0); setPhase("running");
  }, []);

  useEffect(() => {
    if (phase === "dead") return;
    const loop = () => {
      if (phaseRef.current === "idle") { frameRef.current = requestAnimationFrame(loop); return; }
      frameCountRef.current++;
      const fc = frameCountRef.current;
      speedRef.current = SPEED_START + fc * SPEED_INC;
      velRef.current += GRAVITY;
      dinoYRef.current = Math.max(0, dinoYRef.current - velRef.current);
      nextCactusRef.current--;
      if (nextCactusRef.current <= 0) {
        const h = 45 + Math.random() * 35;
        cactiRef.current = [...cactiRef.current, { id: idNext.current++, x: containerW + 40, h }];
        nextCactusRef.current = 80 + Math.random() * 60;
      }
      cactiRef.current = cactiRef.current.map(c => ({ ...c, x: c.x - speedRef.current })).filter(c => c.x > -60);
      scoreRef.current = Math.floor(fc / 6);
      const hit = cactiRef.current.some(c =>
        (DINO_X + DINO_W - 10) > (c.x + 4) && DINO_X < (c.x + CACTUS_W - 4) &&
        dinoYRef.current + GROUND < GROUND + c.h
      );
      if (hit) {
        phaseRef.current = "dead";
        setHighScore(prev => Math.max(prev, scoreRef.current));
        setPhase("dead"); setScore(scoreRef.current); setCacti([...cactiRef.current]); setDinoY(dinoYRef.current);
        return;
      }
      setDinoY(dinoYRef.current); setCacti([...cactiRef.current]); setScore(scoreRef.current);
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [phase, containerW]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") { e.preventDefault(); jump(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [jump]);

  return (
    <div ref={containerRef} style={{ width: "100%", maxWidth: 860, margin: "0 auto", userSelect: "none" }} onClick={phase !== "dead" ? jump : undefined}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 10, color: "rgba(28,25,23,0.4)" }}>
          HI {String(highScore).padStart(5, "0")}
        </span>
        <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 10, color: "#1C1917" }}>
          {String(score).padStart(5, "0")}
        </span>
      </div>
      <div style={{ position: "relative", height: 280, background: "#EDEAE0", border: "2px solid rgba(28,25,23,0.15)", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ position: "absolute", bottom: GROUND - 2, left: 0, right: 0, height: 2, background: "rgba(28,25,23,0.2)" }} />
        <div style={{ position: "absolute", left: DINO_X, bottom: GROUND + dinoY, width: DINO_W, height: DINO_H, display: "flex", alignItems: "flex-end" }}>
          <PixelDino px={6} />
        </div>
        {cacti.map(c => (
          <div key={c.id} style={{ position: "absolute", left: c.x, bottom: GROUND, width: CACTUS_W, height: c.h }}>
            <Cactus height={c.h} />
          </div>
        ))}
        {phase === "idle" && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 11, color: "rgba(28,25,23,0.5)" }}>
              PRESS SPACE OR TAP TO START
            </p>
          </div>
        )}
        {phase === "dead" && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "rgba(237,234,224,0.85)" }}>
            <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 16, color: "#1C1917" }}>GAME OVER</p>
            <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 10, color: "rgba(28,25,23,0.5)" }}>SCORE: {score}</p>
            <button onClick={e => { e.stopPropagation(); restart(); }} style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 9, padding: "10px 20px", background: "#1C1917", color: "#EDEAE0", border: "none", borderRadius: 9999, cursor: "pointer", letterSpacing: "0.05em" }}>
              RESTART
            </button>
          </div>
        )}
      </div>
      <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 7, color: "rgba(28,25,23,0.3)", marginTop: 10, textAlign: "center" }}>
        SPACE / CLICK TO JUMP
      </p>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
export default function Hero() {
  const [gameActive, setGameActive] = useState(false);

  function openTerminal() {
    window.dispatchEvent(new CustomEvent("deeno:openTerminal"));
  }

  function activateGame() {
    setGameActive(true);
    document.body.style.overflow = "hidden";
  }

  function closeGame() {
    setGameActive(false);
    document.body.style.overflow = "";
  }

  useEffect(() => () => { document.body.style.overflow = ""; }, []);

  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center"
      style={{ background: "#EDEAE0", textAlign: "center" }}
    >
      {/* Game close X */}
      <AnimatePresence>
        {gameActive && (
          <motion.button
            key="game-close"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={closeGame}
            style={{ position: "fixed", top: 20, right: 24, zIndex: 200, width: 40, height: 40, borderRadius: "50%", background: "#1C1917", color: "#EDEAE0", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            aria-label="Close game"
          >
            <X size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="w-full max-w-3xl mx-auto px-6" style={{ paddingTop: 100, paddingBottom: 60 }}>
        <AnimatePresence mode="wait">
          {gameActive ? (
            <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 9, color: "rgba(28,25,23,0.3)", letterSpacing: "0.1em", marginBottom: 24 }}>
                EXTINCTION RUN — YOUR COMPETITION SIMULATOR
              </p>
              <DinoGame />
            </motion.div>
          ) : (
            <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>

              {/* Dino box — click to play game */}
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 40 }}
              >
                <button
                  onClick={activateGame}
                  title="Click to play"
                  aria-label="Start dino game"
                  style={{
                    background: "#F5D0C0",
                    border: "none",
                    borderRadius: 20,
                    padding: 24,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    boxShadow: "0 0 0 0 rgba(28,25,23,0)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.04)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 32px rgba(28,25,23,0.12)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 0 0 rgba(28,25,23,0)";
                  }}
                >
                  <PixelDino px={10} />
                </button>

                {/* "your competition" label */}
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ display: "inline-block", width: 28, height: 1, background: "rgba(28,25,23,0.2)", borderTop: "1px dashed rgba(28,25,23,0.3)" }} />
                  <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 7, color: "rgba(28,25,23,0.35)", letterSpacing: "0.07em" }}>
                    your competition
                  </span>
                  <span style={{ display: "inline-block", width: 28, height: 1, borderTop: "1px dashed rgba(28,25,23,0.3)" }} />
                </div>
              </motion.div>

              {/* Headline — stacked, centered, no pills */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                style={{ marginBottom: 36 }}
              >
                <p style={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: "clamp(15px, 2.8vw, 38px)",
                  color: "#1C1917",
                  lineHeight: 1.5,
                  letterSpacing: "0.02em",
                  marginBottom: 8,
                }}>
                  HOME SERVICES MARKETING
                </p>
                <p style={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: "clamp(11px, 1.8vw, 22px)",
                  color: "#8B7F72",
                  lineHeight: 1.5,
                  letterSpacing: "0.02em",
                  marginBottom: 8,
                }}>
                  that&apos;s not from
                </p>
                <p style={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: "clamp(15px, 2.8vw, 38px)",
                  color: "#8B5CF6",
                  lineHeight: 1.5,
                  letterSpacing: "0.02em",
                }}>
                  67 MILLION YEARS AGO
                </p>
              </motion.div>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
                style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "center", marginBottom: 32 }}
              >
                <button
                  onClick={openTerminal}
                  style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 9, padding: "14px 22px", borderRadius: 9999, background: "#1C1917", color: "#EDEAE0", border: "none", letterSpacing: "0.05em", cursor: "pointer", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#3D3430")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#1C1917")}
                  data-cursor-hover
                >
                  FREE EXTINCTION AUDIT →
                </button>
                <a
                  href="#contact"
                  style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 8, padding: "13px 18px", borderRadius: 9999, background: "transparent", color: "rgba(28,25,23,0.45)", border: "1.5px solid rgba(28,25,23,0.15)", letterSpacing: "0.05em", textDecoration: "none", transition: "all 0.15s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(28,25,23,0.4)"; (e.currentTarget as HTMLAnchorElement).style.color = "#1C1917"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(28,25,23,0.15)"; (e.currentTarget as HTMLAnchorElement).style.color = "rgba(28,25,23,0.45)"; }}
                >
                  GET IN TOUCH
                </a>
              </motion.div>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                style={{ fontFamily: '"Inter Variable","Inter",sans-serif', fontStyle: "italic", fontSize: 15, color: "#8B7F72", fontWeight: 300, maxWidth: 520, margin: "0 auto 56px", lineHeight: 1.7 }}
              >
                We help HVAC, plumbing, and home service businesses evolve through more calls, booked jobs, and real revenue.
              </motion.p>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
                style={{ display: "flex", gap: "clamp(24px, 5vw, 60px)", paddingTop: 24, borderTop: "1px solid rgba(28,25,23,0.1)", flexWrap: "wrap", justifyContent: "center" }}
              >
                {[
                  { n: "70%", l: "of homeowners google before calling" },
                  { n: "2.5×", l: "LSA vs standard PPC conversion" },
                  { n: "15×", l: "more revenue from phone leads" },
                ].map(s => (
                  <div key={s.n} style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
                    <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: "clamp(16px, 2.5vw, 28px)", color: "#1C1917", lineHeight: 1 }}>
                      {s.n}
                    </span>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, color: "#8B7F72" }}>
                      {s.l}
                    </span>
                  </div>
                ))}
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
