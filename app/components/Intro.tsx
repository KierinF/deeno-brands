"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function DinoMark() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="white" aria-hidden="true">
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
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (sessionStorage.getItem("db-intro-seen")) {
      setDone(true);
      return;
    }

    const timers = [
      setTimeout(() => setPhase(1), 350),
      setTimeout(() => setPhase(2), 900),
      setTimeout(() => setPhase(3), 1450),
      setTimeout(() => {
        sessionStorage.setItem("db-intro-seen", "1");
        setDone(true);
      }, 2600),
    ];

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[10000] bg-[#08080E] flex items-center justify-center"
          exit={{
            clipPath: "inset(0 0 100% 0)",
            transition: { duration: 0.9, ease: [0.76, 0, 0.24, 1] },
          }}
          initial={{ clipPath: "inset(0 0 0% 0)" }}
        >
          {/* Corner accents */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="absolute top-8 left-8 w-12 h-12 border-l border-t border-white/10"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="absolute bottom-8 right-8 w-12 h-12 border-r border-b border-white/10"
          />

          {/* Central content */}
          <div className="flex flex-col items-center select-none">
            {/* Dino mark */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="w-16 h-16 rounded-2xl bg-[#8B5CF6] flex items-center justify-center mb-6 shadow-[0_0_60px_rgba(139,92,246,0.4)]"
            >
              <DinoMark />
            </motion.div>

            {/* Brand name */}
            <div className="overflow-hidden mb-2">
              <motion.div
                initial={{ y: "110%" }}
                animate={phase >= 1 ? { y: "0%" } : { y: "110%" }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="text-white font-black text-2xl tracking-[0.3em] uppercase">
                  Deeno Brands
                </span>
              </motion.div>
            </div>

            {/* Tagline */}
            <div className="overflow-hidden mb-8">
              <motion.div
                initial={{ y: "110%" }}
                animate={phase >= 2 ? { y: "0%" } : { y: "110%" }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className="text-[#8B5CF6]/80 text-[11px] tracking-[0.45em] uppercase font-medium">
                  Home Services Marketing
                </span>
              </motion.div>
            </div>

            {/* Sweep line */}
            <motion.div
              className="h-px bg-[#8B5CF6] origin-left w-20"
              initial={{ scaleX: 0 }}
              animate={phase >= 3 ? { scaleX: 1 } : { scaleX: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>

          {/* Loading bar */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center">
            <motion.div
              className="h-px bg-[#8B5CF6]/30 origin-left"
              initial={{ width: 0 }}
              animate={{ width: "80px" }}
              transition={{ duration: 2.2, ease: "linear" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
