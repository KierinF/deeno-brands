"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";

// ─── Cactus obstacle ─────────────────────────────────────────────────────────
function Cactus({ height = 60 }: { height?: number }) {
  return (
    <svg width={28} height={height} viewBox={`0 0 28 ${height}`} fill="#1E2D4E">
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
  const idNext = useRef(0);

  useEffect(() => {
    const obs = new ResizeObserver(entries => setContainerW(entries[0].contentRect.width));
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const jump = useCallback(() => {
    if (phaseRef.current === "idle") { phaseRef.current = "running"; setPhase("running"); }
    if (phaseRef.current === "running" && dinoYRef.current <= 1) velRef.current = JUMP_V;
  }, []);

  const restart = useCallback(() => {
    velRef.current = 0; dinoYRef.current = 0; cactiRef.current = [];
    scoreRef.current = 0; frameCountRef.current = 0; speedRef.current = SPEED_START;
    nextCactusRef.current = 120; phaseRef.current = "running";
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
        <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 10, color: "rgba(28,25,23,0.4)" }}>HI {String(highScore).padStart(5, "0")}</span>
        <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 10, color: "#1C1917" }}>{String(score).padStart(5, "0")}</span>
      </div>
      <div style={{ position: "relative", height: 280, background: "#EDEAE0", border: "2px solid rgba(28,25,23,0.15)", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ position: "absolute", bottom: GROUND - 2, left: 0, right: 0, height: 2, background: "rgba(28,25,23,0.2)" }} />
        <div style={{ position: "absolute", left: DINO_X, bottom: GROUND + dinoY, width: DINO_W, height: DINO_H }}>
          <img src="/dino.png" alt="dino" style={{ width: DINO_W, height: DINO_H, objectFit: "contain", imageRendering: "pixelated" }} />
        </div>
        {cacti.map(c => (
          <div key={c.id} style={{ position: "absolute", left: c.x, bottom: GROUND, width: CACTUS_W, height: c.h }}>
            <Cactus height={c.h} />
          </div>
        ))}
        {phase === "idle" && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 11, color: "rgba(28,25,23,0.5)" }}>PRESS SPACE OR TAP TO START</p>
          </div>
        )}
        {phase === "dead" && (
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "rgba(237,234,224,0.88)" }}>
            <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 16, color: "#1C1917" }}>GAME OVER</p>
            <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 10, color: "rgba(28,25,23,0.5)" }}>SCORE: {score}</p>
            <button onClick={e => { e.stopPropagation(); restart(); }} style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 9, padding: "10px 20px", background: "#1C1917", color: "#EDEAE0", border: "none", borderRadius: 9999, cursor: "pointer" }}>
              RESTART
            </button>
          </div>
        )}
      </div>
      <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 7, color: "rgba(28,25,23,0.3)", marginTop: 10, textAlign: "center" }}>SPACE / CLICK TO JUMP</p>
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
export default function Hero() {
  const [gameActive, setGameActive] = useState(false);

  function openTerminal() {
    window.dispatchEvent(new CustomEvent("deeno:openTerminal"));
  }
  function activateGame() { setGameActive(true); document.body.style.overflow = "hidden"; }
  function closeGame() { setGameActive(false); document.body.style.overflow = ""; }
  useEffect(() => () => { document.body.style.overflow = ""; }, []);

  // Translucent pill style helpers
  const creamPill: React.CSSProperties = {
    background: "rgba(237, 234, 224, 0.90)",
    border: "1px solid rgba(28,25,23,0.1)",
    borderRadius: 100,
    padding: "0.15em 0.6em",
    display: "inline",
    whiteSpace: "nowrap",
  };
  const purplePill: React.CSSProperties = {
    background: "rgba(139, 92, 246, 0.1)",
    border: "1px solid rgba(139,92,246,0.2)",
    borderRadius: 100,
    padding: "0.15em 0.6em",
    display: "inline",
    color: "#8B5CF6",
    whiteSpace: "nowrap",
  };

  const headlineSize = "clamp(13px, 2.4vw, 34px)";
  const sublineSize = "clamp(10px, 1.6vw, 20px)";

  return (
    <section
      style={{
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        background: "#EDEAE0",
      }}
    >
      {/* Game X button */}
      <AnimatePresence>
        {gameActive && (
          <motion.button
            key="game-x"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={closeGame}
            style={{ position: "fixed", top: 20, right: 24, zIndex: 200, width: 40, height: 40, borderRadius: "50%", background: "#1C1917", color: "#EDEAE0", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          >
            <X size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {gameActive ? (
          /* ── GAME MODE ─────────────────────────────── */
          <motion.div
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px" }}
          >
            <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 9, color: "rgba(28,25,23,0.3)", letterSpacing: "0.1em", marginBottom: 24 }}>
              EXTINCTION RUN — YOUR COMPETITION SIMULATOR
            </p>
            <DinoGame />
          </motion.div>
        ) : (
          /* ── NORMAL HERO ────────────────────────────── */
          <motion.div key="hero" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "absolute", inset: 0 }}>

            {/* ── Dino image — upper center, z-index 10 (floats above text) ── */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{
                position: "absolute",
                top: "5vh",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 10,
                textAlign: "center",
              }}
            >
              <button
                onClick={activateGame}
                title="Click to play"
                aria-label="Start dino game"
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "block" }}
              >
                <img
                  src="/dino.png"
                  alt="Pixel dinosaur"
                  style={{
                    height: "clamp(180px, 42vh, 360px)",
                    width: "auto",
                    imageRendering: "pixelated",
                    display: "block",
                    transition: "transform 0.25s ease",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                />
              </button>

              {/* "your competition" label */}
              <div style={{ marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <span style={{ display: "inline-block", width: 24, borderTop: "1px dashed rgba(28,25,23,0.25)" }} />
                <span style={{ fontFamily: '"SF Mono","Fira Code",monospace', fontSize: 9, color: "rgba(28,25,23,0.35)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  your competition
                </span>
                <span style={{ display: "inline-block", width: 24, borderTop: "1px dashed rgba(28,25,23,0.25)" }} />
              </div>
            </motion.div>

            {/* ── Content block — bottom half, overlaps dino feet ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1,
                textAlign: "center",
                padding: "0 24px 3vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "clamp(6px, 1.2vh, 14px)",
              }}
            >
              {/* Headline — ToyFight pill words */}
              <div style={{ lineHeight: 1.6 }}>
                {/* Row 1 */}
                <div style={{ marginBottom: "0.3em" }}>
                  <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: headlineSize, color: "#1C1917" }}>
                    <span style={creamPill}>HOME SERVICES</span>
                    {" "}MARKETING
                  </span>
                </div>
                {/* Row 2 */}
                <div style={{ marginBottom: "0.3em" }}>
                  <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: sublineSize, color: "#8B7F72" }}>
                    that&apos;s not from
                  </span>
                </div>
                {/* Row 3 */}
                <div>
                  <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: headlineSize, color: "#8B5CF6" }}>
                    <span style={purplePill}>67 MILLION YEARS AGO</span>
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", justifyContent: "center" }}>
                <button
                  onClick={openTerminal}
                  style={{ fontFamily: '"Press Start 2P", monospace', fontSize: "clamp(7px, 0.9vw, 9px)", padding: "clamp(9px,1.2vh,13px) clamp(14px,1.6vw,22px)", borderRadius: 9999, background: "#1C1917", color: "#EDEAE0", border: "none", letterSpacing: "0.05em", cursor: "pointer", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#3D3430")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#1C1917")}
                >
                  FREE EXTINCTION AUDIT →
                </button>
                <a
                  href="#contact"
                  style={{ fontFamily: '"Press Start 2P", monospace', fontSize: "clamp(7px, 0.8vw, 8px)", padding: "clamp(8px,1.1vh,12px) clamp(12px,1.4vw,18px)", borderRadius: 9999, background: "transparent", color: "rgba(28,25,23,0.4)", border: "1.5px solid rgba(28,25,23,0.15)", letterSpacing: "0.05em", textDecoration: "none", transition: "all 0.15s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(28,25,23,0.4)"; (e.currentTarget as HTMLAnchorElement).style.color = "#1C1917"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(28,25,23,0.15)"; (e.currentTarget as HTMLAnchorElement).style.color = "rgba(28,25,23,0.4)"; }}
                >
                  GET IN TOUCH
                </a>
              </div>

              {/* Tagline */}
              <p style={{ fontFamily: '"Inter Variable","Inter",sans-serif', fontStyle: "italic", fontSize: "clamp(11px, 1.1vw, 14px)", color: "#8B7F72", fontWeight: 300, maxWidth: 480, margin: 0, lineHeight: 1.6 }}>
                We help HVAC, plumbing, and home service businesses evolve through more calls, booked jobs, and real revenue.
              </p>

              {/* Stats — inline row */}
              <div
                style={{
                  paddingTop: "clamp(6px, 1vh, 12px)",
                  borderTop: "1px solid rgba(28,25,23,0.1)",
                  width: "100%",
                  maxWidth: 680,
                  display: "flex",
                  justifyContent: "center",
                  flexWrap: "wrap",
                  gap: "clamp(12px, 2vw, 32px)",
                }}
              >
                {[
                  { n: "70%", l: "of homeowners google before calling" },
                  { n: "2.5×", l: "LSA vs standard PPC conversion" },
                  { n: "15×", l: "more revenue from phone leads" },
                ].map(s => (
                  <div key={s.n} style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: "clamp(10px, 1.4vw, 16px)", color: "#1C1917", lineHeight: 1 }}>
                      {s.n}
                    </span>
                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(9px, 0.9vw, 11px)", color: "#8B7F72" }}>
                      {s.l}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
