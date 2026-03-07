"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import MagneticButton from "./MagneticButton";

// Minimal 3-toed dino footprint mark
function DinoMark({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="white"
      className={className}
      aria-hidden="true"
    >
      {/* Middle toe — straight up */}
      <path d="M 0 0 C -1.2 -1.5 -1.2 -7.5 0 -11 C 1.2 -7.5 1.2 -1.5 0 0 Z"
        transform="translate(12,16)" />
      {/* Left toe — angled ~-35° */}
      <path d="M 0 0 C -1.2 -1.5 -1.2 -7.5 0 -11 C 1.2 -7.5 1.2 -1.5 0 0 Z"
        transform="translate(12,16) rotate(-36)" />
      {/* Right toe — angled ~+35° */}
      <path d="M 0 0 C -1.2 -1.5 -1.2 -7.5 0 -11 C 1.2 -7.5 1.2 -1.5 0 0 Z"
        transform="translate(12,16) rotate(36)" />
      {/* Heel pad */}
      <ellipse cx="12" cy="21" rx="2.2" ry="1.6" />
    </svg>
  );
}

const links = [
  { label: "Services", href: "#services" },
  { label: "Proof", href: "#proof" },
  { label: "Process", href: "#process" },
  { label: "Early Access", href: "#early-access" },
  { label: "FAQ", href: "#faq" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#08080E]/85 backdrop-blur-2xl border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ scale: 1.1, rotate: -8 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
            className="w-8 h-8 rounded-lg bg-[#8B5CF6] flex items-center justify-center"
          >
            <DinoMark size={18} />
          </motion.div>
          <span className="text-white font-bold text-lg tracking-tight">
            Deeno<span className="text-[#8B5CF6]">.</span>
          </span>
        </a>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="relative text-white/45 hover:text-white text-sm font-medium transition-colors duration-200 group py-1"
            >
              {l.label}
              <span className="absolute bottom-0 left-0 w-0 h-px bg-[#8B5CF6] group-hover:w-full transition-all duration-300" />
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <MagneticButton strength={0.25}>
            <a
              href="#contact"
              className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors duration-200"
              data-cursor-hover
            >
              Get Free Audit
            </a>
          </MagneticButton>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-white/70 hover:text-white transition-colors"
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
            className="md:hidden bg-[#0F0F18]/95 backdrop-blur-xl border-b border-white/5 overflow-hidden"
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
                  className="text-white/60 hover:text-white text-sm font-medium py-1 transition-colors"
                >
                  {l.label}
                </motion.a>
              ))}
              <a
                href="#contact"
                onClick={() => setOpen(false)}
                className="bg-[#8B5CF6] text-white text-sm font-semibold px-5 py-3 rounded-lg text-center mt-1"
              >
                Get Free Audit
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
