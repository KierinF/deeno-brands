"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import ExtinctionTerminal from "./ExtinctionTerminal";

const links = [
  { label: "SERVICES", href: "#services" },
  { label: "CONTACT", href: "#contact" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const handler = () => setTerminalOpen(true);
    window.addEventListener("deeno:openTerminal", handler);
    return () => window.removeEventListener("deeno:openTerminal", handler);
  }, []);

  return (
    <>
      <ExtinctionTerminal open={terminalOpen} onClose={() => setTerminalOpen(false)} />

      <motion.nav
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(237,234,224,0.92)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(28,25,23,0.08)" : "none",
        }}
      >
        <div
          style={{
            maxWidth: "80rem",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            padding: "14px 24px",
          }}
        >
          {/* Logo — col 1, left-aligned */}
          <a
            href="#"
            data-cursor-hover
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
            style={{ display: "inline-flex", alignItems: "center", textDecoration: "none" }}
          >
            <div
              style={{
                height: 36,
                width: logoHovered ? 162 : 36,
                background: "#1C1917",
                borderRadius: 6,
                display: "flex",
                alignItems: "center",
                gap: 8,
                overflow: "hidden",
                whiteSpace: "nowrap",
                flexShrink: 0,
                paddingLeft: logoHovered ? 10 : 8,
                paddingRight: logoHovered ? 12 : 8,
                transition: "width 0.3s ease, padding 0.3s ease",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#EDEAE0" aria-hidden="true" style={{ flexShrink: 0 }}>
                <path d="M 0 0 C -1.2 -1.5 -1.2 -7.5 0 -11 C 1.2 -7.5 1.2 -1.5 0 0 Z" transform="translate(12,16)" />
                <path d="M 0 0 C -1.2 -1.5 -1.2 -7.5 0 -11 C 1.2 -7.5 1.2 -1.5 0 0 Z" transform="translate(12,16) rotate(-36)" />
                <path d="M 0 0 C -1.2 -1.5 -1.2 -7.5 0 -11 C 1.2 -7.5 1.2 -1.5 0 0 Z" transform="translate(12,16) rotate(36)" />
                <ellipse cx="12" cy="21" rx="2.2" ry="1.6" />
              </svg>
              <span
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 7,
                  color: "#EDEAE0",
                  opacity: logoHovered ? 1 : 0,
                  transition: "opacity 0.2s ease 0.1s",
                  letterSpacing: "0.04em",
                  lineHeight: 1,
                }}
              >
                DEENO BRANDS
              </span>
            </div>
          </a>

          {/* Desktop nav links — col 2, centered */}
          <div className="hidden md:flex items-center gap-2">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="transition-all"
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: 9,
                  color: "rgba(28,25,23,0.45)",
                  padding: "8px 16px",
                  borderRadius: 9999,
                  letterSpacing: "0.05em",
                  background: "transparent",
                  border: "1px solid transparent",
                  textDecoration: "none",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "#1C1917";
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(28,25,23,0.06)";
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(28,25,23,0.1)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLAnchorElement).style.color = "rgba(28,25,23,0.45)";
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.borderColor = "transparent";
                }}
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* Right: audit button — col 3, right-aligned */}
          <div className="hidden md:flex items-center justify-end">
            <button
              onClick={() => setTerminalOpen(true)}
              style={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: 8,
                padding: "9px 16px",
                borderRadius: 9999,
                background: "#1C1917",
                color: "#EDEAE0",
                border: "none",
                letterSpacing: "0.05em",
                cursor: "pointer",
              }}
              onMouseEnter={e => (e.currentTarget.style.background = "#3D3430")}
              onMouseLeave={e => (e.currentTarget.style.background = "#1C1917")}
              data-cursor-hover
            >
              FREE EXTINCTION AUDIT
            </button>
          </div>

          {/* Mobile hamburger — visible on small screens, placed at end */}
          <div className="md:hidden flex justify-end" style={{ gridColumn: "3" }}>
            <button
              style={{ color: "#1C1917", background: "none", border: "none", cursor: "pointer" }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <AnimatePresence mode="wait">
                {mobileOpen ? (
                  <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <X size={20} />
                  </motion.div>
                ) : (
                  <motion.div key="m" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                    <Menu size={20} />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden overflow-hidden"
              style={{ background: "#EDEAE0", borderTop: "1px solid rgba(28,25,23,0.08)" }}
            >
              <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
                {links.map(l => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    style={{
                      fontFamily: '"Press Start 2P", monospace',
                      fontSize: 9,
                      color: "rgba(28,25,23,0.5)",
                      letterSpacing: "0.05em",
                      textDecoration: "none",
                    }}
                  >
                    {l.label}
                  </a>
                ))}
                <button
                  onClick={() => { setMobileOpen(false); setTerminalOpen(true); }}
                  style={{
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: 8,
                    padding: "10px 16px",
                    borderRadius: 9999,
                    background: "#1C1917",
                    color: "#EDEAE0",
                    border: "none",
                    letterSpacing: "0.05em",
                    alignSelf: "flex-start",
                    marginTop: 4,
                    cursor: "pointer",
                  }}
                >
                  FREE EXTINCTION AUDIT
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
