"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const sections = [
  { id: "hero", label: "Home" },
  { id: "stats", label: "Guarantees" },
  { id: "services", label: "Treatments" },
  { id: "proof", label: "The Evidence" },
  { id: "process", label: "Protocol" },
  { id: "early-access", label: "Founding Spots" },
  { id: "faq", label: "Field Enquiries" },
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
        ([entry]) => { if (entry.isIntersecting) setActive(i); },
        { threshold: 0.35 }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col items-center gap-0">
      {/* Vertical line */}
      <div
        className="absolute top-2 bottom-2 left-1/2 -translate-x-1/2 w-px"
        style={{ background: "rgba(201,168,76,0.1)" }}
      />

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
                  ? "#C9A84C"
                  : hovered === i
                  ? "rgba(242,232,213,0.5)"
                  : "rgba(242,232,213,0.15)",
            }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-full relative z-10"
          />

          {/* Label on hover */}
          <AnimatePresence>
            {hovered === i && (
              <motion.span
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
                className="absolute right-5 whitespace-nowrap pointer-events-none pr-1"
                style={{
                  fontFamily: '"SF Mono","Fira Code",monospace',
                  fontSize: 9,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(242,232,213,0.4)",
                }}
              >
                {section.label}
              </motion.span>
            )}
          </AnimatePresence>

          {/* Active glow */}
          {active === i && (
            <motion.div
              layoutId="activeGlow"
              className="absolute w-3 h-3 rounded-full blur-sm"
              style={{ background: "rgba(201,168,76,0.3)" }}
              transition={{ duration: 0.3 }}
            />
          )}
        </a>
      ))}
    </div>
  );
}
