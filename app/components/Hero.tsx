"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ExtinctionTerminal from "./ExtinctionTerminal";

// ─── Per-service images + rotating words ──────────────────────────────────────
const SERVICES = [
  { word: "HVAC",         img: "/hvac.png" },
  { word: "PLUMBING",     img: "/plumbing.png" },
  { word: "ELECTRICIAN",  img: "/electrician.png" },
  { word: "PEST REMOVAL", img: "/pest-removal.png" },
  { word: "ROOFING",      img: "/roofing.png" },
];

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
const GROUND = 120;
const DINO_W = 110;
const DINO_H = 140;
const DINO_X = 60;
const CACTUS_W = 28;
const JUMP_V = -11;
const GRAVITY = 0.55;
const SPEED_START = 7;
const SPEED_INC = 0.0008;

interface CactusObj { id: number; x: number; h: number }

function DinoGame({ dinoSrc, onClose }: { dinoSrc: string; onClose: () => void }) {
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
        (DINO_X + DINO_W - 14) > (c.x + 4) && DINO_X < (c.x + CACTUS_W - 4) &&
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
      if (e.code === "Escape") { e.preventDefault(); onClose(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [jump, onClose]);

  return (
    <div ref={containerRef} style={{ width: "100%", maxWidth: 860, margin: "0 auto", userSelect: "none" }} onClick={phase !== "dead" ? jump : undefined}>
      {/* HUD row: HI score | current score | X close */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 10, color: "rgba(28,25,23,0.4)" }}>HI {String(highScore).padStart(5, "0")}</span>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 10, color: "#1C1917" }}>{String(score).padStart(5, "0")}</span>
          <button
            onClick={e => { e.stopPropagation(); onClose(); }}
            title="Close game (ESC)"
            style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 13, color: "rgba(28,25,23,0.45)", background: "none", border: "1px solid rgba(28,25,23,0.15)", borderRadius: 4, padding: "6px 12px", cursor: "pointer", lineHeight: 1 }}
            onMouseEnter={e => { e.currentTarget.style.color = "#1C1917"; e.currentTarget.style.borderColor = "rgba(28,25,23,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(28,25,23,0.45)"; e.currentTarget.style.borderColor = "rgba(28,25,23,0.15)"; }}
          >
            ✕
          </button>
        </div>
      </div>
      <div style={{ position: "relative", height: 360, background: "#EDEAE0", border: "2px solid rgba(28,25,23,0.15)", borderRadius: 8, overflow: "hidden" }}>
        <div style={{ position: "absolute", bottom: GROUND - 2, left: 0, right: 0, height: 2, background: "rgba(28,25,23,0.2)" }} />
        <div style={{ position: "absolute", left: DINO_X, bottom: GROUND + dinoY, width: DINO_W, height: DINO_H }}>
          <img
            src={dinoSrc}
            alt="dino"
            onError={e => { e.currentTarget.src = "/dino.png"; e.currentTarget.onerror = null; }}
            style={{ width: DINO_W, height: DINO_H, objectFit: "contain", imageRendering: "pixelated" }}
          />
        </div>
        {cacti.map(c => (
          <div key={c.id} style={{ position: "absolute", left: c.x, bottom: GROUND, width: CACTUS_W, height: c.h }}>
            <Cactus height={c.h} />
          </div>
        ))}
        {phase === "idle" && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 9, color: "rgba(28,25,23,0.5)", textAlign: "center", padding: "0 16px" }}>PRESS SPACE OR TAP TO START · ESC TO EXIT</p>
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
  const [gameDinoSrc, setGameDinoSrc] = useState("/dino.png");
  const [wordIdx, setWordIdx] = useState(0);
  const [wordVisible, setWordVisible] = useState(true);
  const [terminalOpen, setTerminalOpen] = useState(false);

  // Audit progress bar state
  const [auditState, setAuditState] = useState<"idle" | "running" | "done">("idle");
  const [auditProgress, setAuditProgress] = useState(0);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Tick progress toward 90% while running (~40s to reach 90%)
  useEffect(() => {
    if (auditState === "running") {
      setAuditProgress(0);
      progressTimerRef.current = setInterval(() => {
        setAuditProgress(p => {
          if (p >= 90) { clearInterval(progressTimerRef.current!); return 90; }
          // Ease: faster at start, slower near 90
          const step = Math.max(0.3, (90 - p) * 0.012);
          return Math.min(90, p + step);
        });
      }, 500);
    } else {
      if (progressTimerRef.current) { clearInterval(progressTimerRef.current); progressTimerRef.current = null; }
    }
    return () => { if (progressTimerRef.current) clearInterval(progressTimerRef.current); };
  }, [auditState]);

  // Auto-reset after 10 min of "done"
  useEffect(() => {
    if (auditState === "done") {
      resetTimerRef.current = setTimeout(() => setAuditState("idle"), 10 * 60 * 1000);
    }
    return () => { if (resetTimerRef.current) clearTimeout(resetTimerRef.current); };
  }, [auditState]);

  // Cycle industry words with fade — 4s interval
  useEffect(() => {
    const id = setInterval(() => {
      setWordVisible(false);
      setTimeout(() => {
        setWordIdx(i => (i + 1) % SERVICES.length);
        setWordVisible(true);
      }, 350);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  function openTerminal() { setTerminalOpen(true); }
  function closeTerminal() { setTerminalOpen(false); }
  function activateGame() {
    setGameDinoSrc(SERVICES[wordIdx].img);
    setGameActive(true);
    document.body.style.overflow = "hidden";
  }
  function closeGame() { setGameActive(false); document.body.style.overflow = ""; }
  useEffect(() => () => { document.body.style.overflow = ""; }, []);

  // Translucent pill style helpers
  const creamPill: React.CSSProperties = {
    background: "rgba(237, 234, 224, 0.90)",
    border: "1px solid rgba(28,25,23,0.1)",
    borderRadius: 100,
    // Balanced internal padding; marginRight adds gap OUTSIDE the pill before "MARKETING"
    padding: "0.18em 0.65em 0.18em 0.85em",
    lineHeight: 1,
    display: "inline-block",
    whiteSpace: "nowrap",
    marginRight: "0.55em",
    verticalAlign: "middle",
  };
  const purplePill: React.CSSProperties = {
    background: "rgba(139, 92, 246, 0.1)",
    border: "1px solid rgba(139,92,246,0.2)",
    borderRadius: 100,
    padding: "0.4em 0.85em",
    display: "inline",
    color: "#8B5CF6",
    whiteSpace: "nowrap",
  };

  const headlineSize = "clamp(15px, 2.8vw, 40px)";
  const sublineSize = "clamp(12px, 1.8vw, 24px)";

  const auditLabel =
    auditState === "idle" ? "FREE EXTINCTION AUDIT" :
    auditState === "running" ? "SEE AUDIT" :
    "AUDIT DONE — VIEW REPORT";

  return (
    <section
      style={{
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        background: "#EDEAE0",
      }}
    >
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
            <DinoGame dinoSrc={gameDinoSrc} onClose={closeGame} />
          </motion.div>
        ) : (
          /* ── NORMAL HERO ────────────────────────────── */
          <motion.div
            key="hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              paddingTop: "5vh",
            }}
          >
            {/* ── Dino image ── */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              style={{ zIndex: 10, position: "relative", textAlign: "center", flexShrink: 0 }}
            >
              <button
                onClick={activateGame}
                title="Click to play"
                aria-label="Start dino game"
                style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "block", margin: "0 auto" }}
              >
                <img
                  src={SERVICES[wordIdx].img}
                  alt="Pixel dinosaur"
                  onError={e => { e.currentTarget.src = "/dino.png"; e.currentTarget.onerror = null; }}
                  style={{
                    height: "clamp(200px, 44vh, 360px)",
                    width: "auto",
                    imageRendering: "pixelated",
                    display: "block",
                    margin: "0 auto",
                    opacity: wordVisible ? 1 : 0,
                    transition: "transform 0.25s ease, opacity 0.3s ease",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                />
              </button>
            </motion.div>

            {/* ── Content block ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              style={{
                zIndex: 1,
                marginTop: "clamp(-60px, -7vh, -28px)",
                textAlign: "center",
                padding: "0 24px clamp(12px, 2vh, 28px)",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "clamp(6px, 1vh, 12px)",
              }}
            >
              {/* Headline */}
              <div style={{ lineHeight: 1.6 }}>
                <div style={{ marginBottom: "0.3em" }}>
                  <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: headlineSize, color: "#1C1917" }}>
                    <span style={creamPill}>
                      <span style={{ opacity: wordVisible ? 1 : 0, transition: "opacity 0.3s ease", display: "inline-block" }}>
                        {SERVICES[wordIdx].word}
                      </span>
                    </span>MARKETING
                  </span>
                </div>
                <div style={{ marginBottom: "0.3em" }}>
                  <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: sublineSize, color: "#8B7F72" }}>
                    that&apos;s not from
                  </span>
                </div>
                <div>
                  <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: headlineSize, color: "#8B5CF6" }}>
                    <span style={purplePill}>67 MILLION YEARS AGO</span>
                  </span>
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", justifyContent: "center", marginTop: "clamp(8px, 1.2vh, 14px)", marginBottom: "clamp(6px, 1vh, 12px)" }}>
                {/* Progress-aware audit button */}
                <button
                  onClick={openTerminal}
                  style={{
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: "clamp(9px, 1.05vw, 12px)",
                    padding: "clamp(13px,1.8vh,18px) clamp(20px,2.2vw,30px)",
                    borderRadius: 9999,
                    background: "#1C1917",
                    color: "#EDEAE0",
                    border: "none",
                    letterSpacing: "0.05em",
                    cursor: "pointer",
                    transition: "background 0.15s",
                    position: "relative",
                    overflow: "hidden",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5em",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#3D3430")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#1C1917")}
                >
                  {/* Progress bar fill */}
                  {auditState !== "idle" && (
                    <span style={{
                      position: "absolute",
                      top: 0, bottom: 0, left: 0,
                      width: `${auditProgress}%`,
                      background: "rgba(139,92,246,0.35)",
                      transition: "width 0.5s ease",
                      borderRadius: "inherit",
                      pointerEvents: "none",
                    }} />
                  )}
                  <span style={{ position: "relative", zIndex: 1 }}>{auditLabel}</span>
                  <svg
                    width="1em" height="1em" viewBox="0 0 16 16" fill="none"
                    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ position: "relative", zIndex: 1, flexShrink: 0 }}
                  >
                    <path d="M2 8h12M9 3l5 5-5 5" />
                  </svg>
                </button>

                <a
                  href="#contact"
                  style={{ fontFamily: '"Press Start 2P", monospace', fontSize: "clamp(8px, 0.9vw, 10px)", padding: "clamp(12px,1.7vh,17px) clamp(18px,2vw,26px)", borderRadius: 9999, background: "transparent", color: "rgba(28,25,23,0.4)", border: "1.5px solid rgba(28,25,23,0.15)", letterSpacing: "0.05em", textDecoration: "none", transition: "all 0.15s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(28,25,23,0.4)"; (e.currentTarget as HTMLAnchorElement).style.color = "#1C1917"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(28,25,23,0.15)"; (e.currentTarget as HTMLAnchorElement).style.color = "rgba(28,25,23,0.4)"; }}
                >
                  GET IN TOUCH
                </a>
              </div>

              {/* Tagline */}
              <p style={{ fontFamily: '"Inter Variable","Inter",sans-serif', fontStyle: "italic", fontSize: "clamp(13px, 1.5vw, 18px)", color: "#8B7F72", fontWeight: 300, maxWidth: 580, margin: 0, lineHeight: 1.6 }}>
                We help local service businesses evolve via more calls, booked jobs, and real revenue.
              </p>

              {/* Stats — wrapping row */}
              <div
                style={{
                  paddingTop: "clamp(6px, 1vh, 12px)",
                  borderTop: "1px solid rgba(28,25,23,0.1)",
                  width: "100%",
                  maxWidth: 720,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "clamp(10px, 2vw, 24px)",
                  rowGap: "clamp(6px, 1vh, 10px)",
                  overflow: "visible",
                }}
              >
                {[
                  { n: "76%", l: "of local searches end in a call" },
                  { n: "3×", l: "more leads from Local Service Ads" },
                  { n: "$18K", l: "avg. HVAC replacement value" },
                ].map((s, i) => (
                  <React.Fragment key={s.n}>
                    {i > 0 && (
                      <span style={{ color: "rgba(28,25,23,0.2)", fontSize: 16, flexShrink: 0 }}>·</span>
                    )}
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexShrink: 0, whiteSpace: "nowrap" }}>
                      <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: "clamp(11px, 1.5vw, 17px)", color: "#1C1917", lineHeight: 1 }}>
                        {s.n}
                      </span>
                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(11px, 1vw, 14px)", color: "#8B7F72", whiteSpace: "nowrap" }}>
                        {s.l}
                      </span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Extinction Terminal modal */}
      <ExtinctionTerminal
        open={terminalOpen}
        onClose={closeTerminal}
        onAuditStart={() => { setAuditState("running"); setAuditProgress(0); }}
        onAuditProgress={(pct) => setAuditProgress(pct)}
        onAuditDone={() => { setAuditState("done"); setAuditProgress(100); }}
      />
    </section>
  );
}
