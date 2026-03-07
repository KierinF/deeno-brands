"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TYPING_LINES = [
  "> LOADING FIELD SPECIMEN DATA...",
  "> CROSS-REFERENCING EXTINCTION RECORDS...",
  "> SURVIVAL PROTOCOLS READY.",
];

function DinoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white" aria-hidden="true">
      <path d="M 0 0 C -1.2 -1.5 -1.2 -7.5 0 -11 C 1.2 -7.5 1.2 -1.5 0 0 Z"
        transform="translate(12,16)" />
      <path d="M 0 0 C -1.2 -1.5 -1.2 -7.5 0 -11 C 1.2 -7.5 1.2 -1.5 0 0 Z"
        transform="translate(12,16) rotate(-36)" />
      <path d="M 0 0 C -1.2 -1.5 -1.2 -7.5 0 -11 C 1.2 -7.5 1.2 -1.5 0 0 Z"
        transform="translate(12,16) rotate(36)" />
      <ellipse cx="12" cy="21" rx="2.2" ry="1.6" />
    </svg>
  );
}

export default function Intro() {
  const [done, setDone] = useState(false);
  const [lineIndex, setLineIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [showLogo, setShowLogo] = useState(false);
  const charRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("db-intro-seen")) {
      setDone(true);
      return;
    }

    const currentLine = TYPING_LINES[lineIndex] ?? "";
    charRef.current = 0;

    function typeChar() {
      if (charRef.current < currentLine.length) {
        setDisplayedText(currentLine.slice(0, charRef.current + 1));
        charRef.current++;
        timerRef.current = setTimeout(typeChar, 28 + Math.random() * 16);
      } else {
        timerRef.current = setTimeout(() => {
          if (lineIndex < TYPING_LINES.length - 1) {
            setLineIndex(i => i + 1);
            setDisplayedText("");
          } else {
            setShowLogo(true);
            timerRef.current = setTimeout(() => {
              sessionStorage.setItem("db-intro-seen", "1");
              setDone(true);
            }, 1100);
          }
        }, 380);
      }
    }

    timerRef.current = setTimeout(typeChar, lineIndex === 0 ? 450 : 80);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lineIndex]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{
            clipPath: "inset(0 0 100% 0)",
            transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[300] flex flex-col items-center justify-center select-none"
          style={{ background: "#0E0B07" }}
        >
          {/* Amber vignette */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(201,168,76,0.05) 0%, transparent 70%)",
            }}
          />

          {/* Gold grid dots */}
          <div className="absolute inset-0 gold-grid opacity-60 pointer-events-none" />

          {/* Museum frame corners */}
          {[
            "top-8 left-8 border-l border-t",
            "top-8 right-8 border-r border-t",
            "bottom-8 left-8 border-l border-b",
            "bottom-8 right-8 border-r border-b",
          ].map((cls, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className={`absolute w-10 h-10 ${cls}`}
              style={{ borderColor: "rgba(201,168,76,0.2)" }}
            />
          ))}

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-5">
            {/* Typing text */}
            <AnimatePresence mode="wait">
              {!showLogo && (
                <motion.p
                  key={`line-${lineIndex}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    fontFamily: '"SF Mono","Fira Code",monospace',
                    fontSize: 11,
                    letterSpacing: "0.18em",
                    color: "rgba(201,168,76,0.55)",
                  }}
                >
                  {displayedText}
                  <span
                    style={{
                      display: "inline-block",
                      width: 7,
                      height: 12,
                      background: "#C9A84C",
                      opacity: 0.6,
                      marginLeft: 2,
                      verticalAlign: "text-bottom",
                      animation: "blink 1s step-end infinite",
                    }}
                  />
                </motion.p>
              )}
            </AnimatePresence>

            {/* Logo reveal */}
            <AnimatePresence>
              {showLogo && (
                <motion.div
                  key="logo"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center gap-4"
                >
                  <div
                    className="flex items-center justify-center rounded-xl"
                    style={{
                      width: 56,
                      height: 56,
                      background: "#8B5CF6",
                      boxShadow: "0 0 40px rgba(139,92,246,0.45), 0 0 0 1px rgba(201,168,76,0.2)",
                    }}
                  >
                    <DinoMark size={28} />
                  </div>
                  <div className="text-center">
                    <div
                      style={{
                        fontFamily: "'Playfair Display', Georgia, serif",
                        fontSize: 28,
                        color: "#F2E8D5",
                        letterSpacing: "-0.01em",
                        lineHeight: 1,
                      }}
                    >
                      Deeno<span style={{ color: "#8B5CF6" }}>.</span>
                    </div>
                    <div
                      style={{
                        fontFamily: '"SF Mono","Fira Code",monospace',
                        fontSize: 10,
                        letterSpacing: "0.22em",
                        color: "rgba(201,168,76,0.45)",
                        marginTop: 8,
                      }}
                    >
                      EST. 2025 // HOME SERVICES DIVISION
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
