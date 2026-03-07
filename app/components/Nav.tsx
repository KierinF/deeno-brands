"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import MagneticButton from "./MagneticButton";
import ExtinctionTerminal from "./ExtinctionTerminal";

function DinoMark({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white" className={className} aria-hidden="true">
      <path d="M 0 0 C -1.2 -1.5 -1.2 -7.5 0 -11 C 1.2 -7.5 1.2 -1.5 0 0 Z" transform="translate(12,16)" />
      <path d="M 0 0 C -1.2 -1.5 -1.2 -7.5 0 -11 C 1.2 -7.5 1.2 -1.5 0 0 Z" transform="translate(12,16) rotate(-36)" />
      <path d="M 0 0 C -1.2 -1.5 -1.2 -7.5 0 -11 C 1.2 -7.5 1.2 -1.5 0 0 Z" transform="translate(12,16) rotate(36)" />
      <ellipse cx="12" cy="21" rx="2.2" ry="1.6" />
    </svg>
  );
}

const links = [
  { label: "Treatments", href: "#services" },
  { label: "Evidence", href: "#proof" },
  { label: "Protocol", href: "#process" },
  { label: "Founding Spots", href: "#early-access" },
  { label: "FAQ", href: "#faq" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Listen for custom event from Hero button
  useEffect(() => {
    const handler = () => setTerminalOpen(true);
    window.addEventListener("deeno:openTerminal", handler);
    return () => window.removeEventListener("deeno:openTerminal", handler);
  }, []);

  return (
    <>
      <ExtinctionTerminal open={terminalOpen} onClose={() => setTerminalOpen(false)} />

      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled
            ? "backdrop-blur-2xl"
            : "bg-transparent"
        }`}
        style={scrolled ? {
          background: "rgba(14,11,7,0.9)",
          borderBottom: "1px solid rgba(201,168,76,0.12)",
        } : undefined}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <motion.div
              whileHover={{ scale: 1.1, rotate: -8 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
              className="w-8 h-8 rounded-lg bg-[#8B5CF6] flex items-center justify-center"
              style={{ boxShadow: "0 0 16px rgba(139,92,246,0.3)" }}
            >
              <DinoMark size={18} />
            </motion.div>
            <span
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 19,
                color: "#F2E8D5",
                letterSpacing: "-0.01em",
              }}
            >
              Deeno<span style={{ color: "#8B5CF6" }}>.</span>
            </span>
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-7">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="relative text-sm font-medium transition-colors duration-200 group py-1"
                style={{ color: "rgba(242,232,213,0.4)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#F2E8D5")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(242,232,213,0.4)")}
              >
                {l.label}
                <span
                  className="absolute bottom-0 left-0 w-0 h-px group-hover:w-full transition-all duration-300"
                  style={{ background: "#C9A84C" }}
                />
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <MagneticButton strength={0.25}>
              <button
                onClick={() => setTerminalOpen(true)}
                className="text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-all duration-200 tracking-wide"
                style={{
                  background: "#8B5CF6",
                  letterSpacing: "0.06em",
                }}
                data-cursor-hover
              >
                ASSESS EXTINCTION RISK
              </button>
            </MagneticButton>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden transition-colors"
            style={{ color: "rgba(242,232,213,0.6)" }}
            onClick={() => setOpen(!open)}
          >
            <AnimatePresence mode="wait">
              {open ? (
                <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <X size={22} />
                </motion.div>
              ) : (
                <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                  <Menu size={22} />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
              className="md:hidden backdrop-blur-xl overflow-hidden"
              style={{
                background: "rgba(14,11,7,0.95)",
                borderBottom: "1px solid rgba(201,168,76,0.12)",
              }}
            >
              <div className="px-6 py-5 flex flex-col gap-4">
                {links.map((l, i) => (
                  <motion.a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3 }}
                    className="text-sm font-medium py-1 transition-colors"
                    style={{ color: "rgba(242,232,213,0.5)" }}
                  >
                    {l.label}
                  </motion.a>
                ))}
                <button
                  onClick={() => { setOpen(false); setTerminalOpen(true); }}
                  className="text-white text-xs font-bold px-5 py-3 rounded-lg text-center mt-1 tracking-widest"
                  style={{ background: "#8B5CF6", letterSpacing: "0.08em" }}
                >
                  ASSESS EXTINCTION RISK
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
