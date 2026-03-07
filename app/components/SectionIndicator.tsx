"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const sections = [
  { id: "hero", label: "Home" },
  { id: "stats", label: "Guarantees" },
  { id: "services", label: "Services" },
  { id: "proof", label: "The Proof" },
  { id: "process", label: "Process" },
  { id: "early-access", label: "Early Access" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Get Started" },
];

export default function SectionIndicator() {
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach((section, i) => {
      const el = document.getElementById(section.id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActive(i);
          }
        },
        { threshold: 0.35 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center gap-0">
      {/* Vertical connecting line */}
      <div className="absolute top-2 bottom-2 left-1/2 -translate-x-1/2 w-px bg-white/8" />

      {sections.map((section, i) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className="relative flex items-center justify-center py-2.5"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(null)}
        >
          {/* Dot */}
          <motion.div
            animate={{
              width: active === i ? 8 : 5,
              height: active === i ? 8 : 5,
              backgroundColor:
                active === i
                  ? "#8B5CF6"
                  : hovered === i
                  ? "rgba(255,255,255,0.5)"
                  : "rgba(255,255,255,0.15)",
            }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-full relative z-10"
          />

          {/* Label — appears on hover, slides in from right */}
          <AnimatePresence>
            {hovered === i && (
              <motion.span
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
                className="absolute right-5 whitespace-nowrap text-[10px] font-semibold tracking-widest uppercase text-white/50 pointer-events-none pr-1"
              >
                {section.label}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Active section: orange glow behind dot */}
          {active === i && (
            <motion.div
              layoutId="activeGlow"
              className="absolute w-3 h-3 rounded-full bg-[#8B5CF6]/25 blur-sm"
              transition={{ duration: 0.3 }}
            />
          )}
        </a>
      ))}
    </div>
  );
}
