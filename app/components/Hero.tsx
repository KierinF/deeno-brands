"use client";

import { motion, AnimatePresence } from "framer-motion";
import { type ReactNode, useState, useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";

// ─── Pill component ────────────────────────────────────────────────────────────
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
        fontSize: "clamp(20px, 3.5vw, 50px)",
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

// ─── Improved pixel T-Rex (more recognisable silhouette) ─────────────────────
function PixelDino({ dim = 10 }: { dim?: number }) {
  const c = "#1C1917";
  const px = dim;

  // T-Rex pixel grid — larger head, big jaw, stubby arms, thick legs
  // Each entry is [col, row]. Grid is 14 cols × 18 rows.
  const body: [number, number][] = [
    // ── Head (cols 6-13, rows 0-4) ──
    [7,0],[8,0],[9,0],[10,0],[11,0],
    [6,1],[7,1],[8,1],[9,1],[10,1],[11,1],[12,1],
    [5,2],[6,2],[7,2],[8,2],[9,2],[10,2],[11,2],[12,2],[13,2],
    [5,3],[6,3],[7,3],[8,3],[9,3],[10,3],[11,3],[12,3],[13,3],
    [5,4],[6,4],[7,4],[8,4],[9,4],[10,4],[11,4],[12,4],
    // ── Jaw (open mouth) ──
    [9,5],[10,5],[11,5],[12,5],[13,5],
    [11,6],[12,6],[13,6],
    // ── Teeth ──
    [9,5],[11,5],[13,5], // already in jaw rows — just note for eye contrast
    // ── Neck ──
    [5,5],[6,5],
    [4,6],[5,6],[6,6],
    [4,7],[5,7],
    // ── Body ──
    [2,8],[3,8],[4,8],[5,8],[6,8],[7,8],
    [1,9],[2,9],[3,9],[4,9],[5,9],[6,9],[7,9],
    [1,10],[2,10],[3,10],[4,10],[5,10],[6,10],[7,10],
    [1,11],[2,11],[3,11],[4,11],[5,11],[6,11],
    [2,12],[3,12],[4,12],[5,12],
    // ── Tail ──
    [0,10],[0,11],
    [0,12],[1,12],
    // ── Tiny arm ──
    [6,7],[7,7],
    [7,8],
    // ── Legs ──
    [3,13],[4,13],
    [3,14],[4,14],
    [3,15],[4,15],
    [2,16],[3,16],
    [1,17],[2,17],
    // right leg
    [5,13],[6,13],
    [5,14],[6,14],
    [6,15],[7,15],
    [6,16],[7,16],
    [6,17],[7,17],[8,17],
  ];

  const W = 14 * px;
  const H = 18 * px;

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      fill="none"
      aria-label="Pixel T-Rex dinosaur"
    >
      {body.map(([col, row]) => (
        <rect key={`${col}-${row}`} x={col * px} y={row * px} width={px} height={px} fill={c} />
      ))}
      {/* Eye — cream */}
      <rect x={9 * px} y={1 * px} width={px} height={px} fill="#EDEAE0" />
      {/* Pupil */}
      <rect x={9 * px + 3} y={1 * px + 3} width={px - 5} height={px - 5} fill="#1C1917" />
      {/* Teeth (light) */}
      <rect x={10 * px} y={5 * px} width={px} height={px} fill="#EDEAE0" />
      <rect x={12 * px} y={5 * px} width={px} height={px} fill="#EDEAE0" />
    </svg>
  );
}

// ─── Cactus obstacle SVG ──────────────────────────────────────────────────────
function Cactus({ height = 60 }: { height?: number }) {
  return (
    <svg width={28} height={height} viewBox={`0 0 28 ${height}`} fill="#1C1917">
      {/* main trunk */}
      <rect x={10} y={0} width={8} height={height} />
      {/* left arm */}
      <rect x={0} y={Math.floor(height * 0.3)} width={10} height={6} />
      <rect x={0} y={Math.floor(height * 0.15)} width={6} height={Math.floor(height * 0.2)} />
      {/* right arm */}
      <rect x={18} y={Math.floor(height * 0.4)} width={10} height={6} />
      <rect x={22} y={Math.floor(height * 0.25)} width={6} height={Math.floor(height * 0.2)} />
    </svg>
  );
}

// ─── Dino Game ────────────────────────────────────────────────────────────────
const GROUND = 90;       // px from bottom of game area
const DINO_W = 70;
const DINO_H = 90;
const DINO_X = 60;
const CACTUS_W = 28;
const JUMP_V = -14;
const GRAVITY = 0.55;
const SPEED_START = 5;
const SPEED_INC = 0.0008;

interface CactusObj { id: number; x: number; h: number }

function DinoGame({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<"idle" | "running" | "dead">("idle");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [dinoY, setDinoY] = useState(0);          // offset from ground (0 = on ground)
  const [cacti, setCacti] = useState<CactusObj[]>([]);

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
  const [containerW, setContainerW] = useState(800);

  useEffect(() => {
    const obs = new ResizeObserver(entries => {
      setContainerW(entries[0].contentRect.width);
    });
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
    setDinoY(0);
    setCacti([]);
    setScore(0);
    setPhase("running");
  }, []);

  // Game loop
  useEffect(() => {
    if (phase === "dead") return;

    let idNext = Date.now();

    const loop = () => {
      if (phaseRef.current === "idle") {
        frameRef.current = requestAnimationFrame(loop);
        return;
      }

      frameCountRef.current++;
      const fc = frameCountRef.current;
      speedRef.current = SPEED_START + fc * SPEED_INC;

      // Physics
      velRef.current += GRAVITY;
      dinoYRef.current = Math.max(0, dinoYRef.current - velRef.current);

      // Spawn cactus
      nextCactusRef.current--;
      if (nextCactusRef.current <= 0) {
        const h = 45 + Math.random() * 35;
        cactiRef.current = [...cactiRef.current, { id: idNext++, x: containerW + 40, h }];
        nextCactusRef.current = 80 + Math.random() * 60;
      }

      // Move cacti
      cactiRef.current = cactiRef.current
        .map(c => ({ ...c, x: c.x - speedRef.current }))
        .filter(c => c.x > -60);

      // Score
      scoreRef.current = Math.floor(fc / 6);

      // Collision — dino bbox vs cactus bbox
      const dinoBottom = GROUND;
      const dinoTop = dinoBottom + DINO_H;
      const dinoLeft = DINO_X;
      const dinoRight = DINO_X + DINO_W - 10; // small inset for forgiveness

      const hit = cactiRef.current.some(c => {
        const cx = c.x + 4; // inset left
        const cr = c.x + CACTUS_W - 4; // inset right
        const cTop = GROUND + c.h;
        return dinoRight > cx && dinoLeft < cr &&
               dinoYRef.current + dinoBottom < cTop;
      });

      if (hit) {
        phaseRef.current = "dead";
        setHighScore(prev => Math.max(prev, scoreRef.current));
        setPhase("dead");
        setScore(scoreRef.current);
        setCacti([...cactiRef.current]);
        setDinoY(dinoYRef.current);
        return;
      }

      setDinoY(dinoYRef.current);
      setCacti([...cactiRef.current]);
      setScore(scoreRef.current);

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameRef.current);
  }, [phase, containerW]);

  // Keyboard + click → jump
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [jump]);

  const gameAreaH = 280;

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        maxWidth: 860,
        margin: "0 auto",
        position: "relative",
        userSelect: "none",
      }}
      onClick={phase !== "dead" ? jump : undefined}
    >
      {/* Score */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 10, color: "rgba(28,25,23,0.4)" }}>
          HI {String(highScore).padStart(5, "0")}
        </span>
        <span style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 10, color: "#1C1917" }}>
          {String(score).padStart(5, "0")}
        </span>
      </div>

      {/* Game viewport */}
      <div
        style={{
          position: "relative",
          height: gameAreaH,
          background: "#EDEAE0",
          border: "2px solid rgba(28,25,23,0.15)",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {/* Ground line */}
        <div
          style={{
            position: "absolute",
            bottom: GROUND - 2,
            left: 0,
            right: 0,
            height: 2,
            background: "rgba(28,25,23,0.2)",
          }}
        />

        {/* Dino */}
        <div
          style={{
            position: "absolute",
            left: DINO_X,
            bottom: GROUND + dinoY,
            width: DINO_W,
            height: DINO_H,
            display: "flex",
            alignItems: "flex-end",
          }}
        >
          <PixelDino dim={7} />
        </div>

        {/* Cacti */}
        {cacti.map(c => (
          <div
            key={c.id}
            style={{
              position: "absolute",
              left: c.x,
              bottom: GROUND,
              width: CACTUS_W,
              height: c.h,
            }}
          >
            <Cactus height={c.h} />
          </div>
        ))}

        {/* Idle prompt */}
        {phase === "idle" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
            }}
          >
            <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 11, color: "rgba(28,25,23,0.5)" }}>
              PRESS SPACE OR TAP TO START
            </p>
          </div>
        )}

        {/* Dead overlay */}
        {phase === "dead" && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              background: "rgba(237,234,224,0.85)",
            }}
          >
            <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 16, color: "#1C1917" }}>
              GAME OVER
            </p>
            <p style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 10, color: "rgba(28,25,23,0.5)" }}>
              SCORE: {score}
            </p>
            <button
              onClick={e => { e.stopPropagation(); restart(); }}
              style={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: 9,
                padding: "10px 20px",
                background: "#1C1917",
                color: "#EDEAE0",
                border: "none",
                borderRadius: 9999,
                cursor: "pointer",
                letterSpacing: "0.05em",
              }}
            >
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

  // Clean up scroll lock if component unmounts while game is open
  useEffect(() => {
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <section
      className="relative min-h-screen flex flex-col"
      style={{ background: "#EDEAE0" }}
    >
      {/* Game close button — fixed in viewport when game is active */}
      <AnimatePresence>
        {gameActive && (
          <motion.button
            key="game-close"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={closeGame}
            style={{
              position: "fixed",
              top: 20,
              right: 24,
              zIndex: 200,
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#1C1917",
              color: "#EDEAE0",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
            aria-label="Close game"
          >
            <X size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      <div
        className="flex-1 flex flex-col items-start justify-center max-w-7xl mx-auto w-full px-6"
        style={{ paddingTop: 80, paddingBottom: 40 }}
      >
        <AnimatePresence mode="wait">
          {gameActive ? (
            /* ── GAME MODE ── */
            <motion.div
              key="game"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ width: "100%" }}
            >
              <p
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 9,
                  color: "rgba(28,25,23,0.3)",
                  letterSpacing: "0.1em",
                  marginBottom: 24,
                }}
              >
                EXTINCTION RUN — YOUR COMPETITION SIMULATOR
              </p>
              <DinoGame onClose={closeGame} />
            </motion.div>
          ) : (
            /* ── NORMAL HERO ── */
            <motion.div
              key="hero-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ width: "100%" }}
            >
              <div className="grid lg:grid-cols-[1fr_300px] gap-10 lg:gap-4 items-center w-full">

                {/* Left: Headline + CTAs */}
                <div>
                  {/* Pill-word headline */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.15 }}
                    style={{ lineHeight: 1, marginBottom: 32 }}
                  >
                    {/* Line 1 */}
                    <div style={{ marginBottom: 6 }}>
                      <Pill v="dark">Home services marketing</Pill>
                    </div>

                    {/* Line 2 */}
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 0 }}>
                      <span
                        style={{
                          fontFamily: '"Press Start 2P", monospace',
                          fontSize: "clamp(14px, 2.2vw, 32px)",
                          color: "rgba(28,25,23,0.35)",
                          padding: "0.35em 0.4em",
                          display: "inline-block",
                          verticalAlign: "middle",
                          lineHeight: 1.4,
                        }}
                      >
                        that&apos;s not from
                      </span>
                      <Pill v="purple">67 million years ago</Pill>
                    </div>
                  </motion.div>

                  {/* Tagline */}
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55, duration: 0.5 }}
                    style={{
                      fontFamily: '"Inter Variable","Inter",sans-serif',
                      fontStyle: "italic",
                      fontSize: 15,
                      color: "#8B7F72",
                      marginBottom: 40,
                      fontWeight: 300,
                      maxWidth: 480,
                      lineHeight: 1.6,
                    }}
                  >
                    We help HVAC, plumbing, and home service businesses evolve through more calls, booked jobs, and real revenue.
                  </motion.p>

                  {/* CTAs */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
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
                      FREE EXTINCTION AUDIT →
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

                {/* Right: Pixel dino with "your competition" label */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className="hidden lg:flex justify-center items-end"
                  style={{ paddingBottom: 48 }}
                >
                  <div style={{ position: "relative", display: "inline-flex", flexDirection: "column", alignItems: "center" }}>
                    {/* Clickable dino — triggers game */}
                    <button
                      onClick={activateGame}
                      style={{
                        background: "none",
                        border: "none",
                        padding: 0,
                        cursor: "pointer",
                        display: "block",
                        opacity: 1,
                        transition: "opacity 0.15s",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.opacity = "0.8")}
                      onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                      title="Click me!"
                      aria-label="Start dino game"
                    >
                      <PixelDino dim={12} />
                    </button>

                    {/* "your competition" label with arrow */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: -8,
                        left: "50%",
                        transform: "translateX(-80%)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        pointerEvents: "none",
                      }}
                    >
                      {/* Curved arrow pointing up toward dino */}
                      <svg width="60" height="40" viewBox="0 0 60 40" fill="none">
                        <path
                          d="M 50 38 C 45 20, 20 10, 10 4"
                          stroke="rgba(28,25,23,0.35)"
                          strokeWidth="1.5"
                          strokeDasharray="3 3"
                          fill="none"
                        />
                        {/* Arrowhead */}
                        <path
                          d="M 10 4 L 6 10 M 10 4 L 16 7"
                          stroke="rgba(28,25,23,0.35)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span
                        style={{
                          fontFamily: '"Press Start 2P", monospace',
                          fontSize: 7,
                          color: "rgba(28,25,23,0.4)",
                          letterSpacing: "0.06em",
                          whiteSpace: "nowrap",
                          marginTop: -8,
                        }}
                      >
                        your competition
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Bottom stats row */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.0, duration: 0.5 }}
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
