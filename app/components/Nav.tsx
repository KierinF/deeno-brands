"use client";

import { useState, useEffect, useRef } from "react";

const industries = [
  { label: "Commercial HVAC", href: "#industries" },
  { label: "Commercial Electrical", href: "#industries" },
  { label: "Commercial Plumbing", href: "#industries" },
  { label: "Commercial Landscaping", href: "#industries" },
  { label: "Commercial Pest Control", href: "#industries" },
];

const links = [
  { label: "How It Works", href: "#process" },
  { label: "Industries", href: "#industries", dropdown: true },
  { label: "Results", href: "#proof" },
  { label: "About", href: "#about" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navBg = scrolled ? "rgba(10,10,10,0.95)" : "transparent";

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: navBg,
        backdropFilter: scrolled ? "blur(12px)" : "none",
        borderBottom: scrolled ? "1px solid #2A2A2A" : "none",
        transition: "background 0.3s ease, border-color 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <a href="#" style={{ textDecoration: "none" }}>
          <span
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 28,
              letterSpacing: "3px",
              color: "#E8FF47",
            }}
          >
            DEENO
          </span>
        </a>

        {/* Desktop links */}
        <div
          className="hidden md:flex"
          style={{ alignItems: "center", gap: 8 }}
        >
          {links.map((l) =>
            l.dropdown ? (
              <div key={l.label} ref={dropdownRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 11,
                    letterSpacing: "1.5px",
                    color: dropdownOpen ? "#F5F5F2" : "#666",
                    background: "none",
                    border: "none",
                    padding: "8px 16px",
                    cursor: "pointer",
                    transition: "color 0.2s",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#F5F5F2")}
                  onMouseLeave={(e) => {
                    if (!dropdownOpen) (e.currentTarget as HTMLButtonElement).style.color = "#666";
                  }}
                >
                  {l.label}
                  <span style={{ fontSize: 8, opacity: 0.6 }}>▾</span>
                </button>
                {dropdownOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      background: "#111111",
                      border: "1px solid #2A2A2A",
                      minWidth: 220,
                      marginTop: 4,
                      zIndex: 200,
                    }}
                  >
                    {industries.map((ind) => (
                      <a
                        key={ind.label}
                        href={ind.href}
                        onClick={() => setDropdownOpen(false)}
                        style={{
                          display: "block",
                          padding: "10px 16px",
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 11,
                          letterSpacing: "1px",
                          color: "#666",
                          textDecoration: "none",
                          borderBottom: "1px solid #1C1C1C",
                          transition: "color 0.15s, background 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.color = "#F5F5F2";
                          (e.currentTarget as HTMLAnchorElement).style.background = "#1C1C1C";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLAnchorElement).style.color = "#666";
                          (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                        }}
                      >
                        {ind.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <a
                key={l.label}
                href={l.href}
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 11,
                  letterSpacing: "1.5px",
                  color: "#666",
                  textDecoration: "none",
                  padding: "8px 16px",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#F5F5F2")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#666")}
              >
                {l.label}
              </a>
            )
          )}
        </div>

        {/* CTA button */}
        <a
          href="#contact"
          className="hidden md:inline-flex"
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            letterSpacing: "1.5px",
            padding: "10px 20px",
            background: "#E8FF47",
            color: "#0A0A0A",
            textDecoration: "none",
            fontWeight: 500,
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#f0ff6e")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#E8FF47")}
        >
          CHECK MY MARKET →
        </a>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: "none",
            border: "1px solid #2A2A2A",
            color: "#F5F5F2",
            padding: "6px 12px",
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            letterSpacing: "1px",
            cursor: "pointer",
          }}
        >
          {mobileOpen ? "CLOSE" : "MENU"}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          style={{
            background: "#111111",
            borderTop: "1px solid #2A2A2A",
            padding: "20px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 12,
                letterSpacing: "1.5px",
                color: "#999",
                textDecoration: "none",
              }}
            >
              {l.label}
            </a>
          ))}
          {industries.map((ind) => (
            <a
              key={ind.label}
              href={ind.href}
              onClick={() => setMobileOpen(false)}
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                letterSpacing: "1px",
                color: "#555",
                textDecoration: "none",
                paddingLeft: 16,
              }}
            >
              → {ind.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setMobileOpen(false)}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              letterSpacing: "1.5px",
              padding: "12px 20px",
              background: "#E8FF47",
              color: "#0A0A0A",
              textDecoration: "none",
              textAlign: "center",
              fontWeight: 500,
            }}
          >
            CHECK MY MARKET →
          </a>
        </div>
      )}
    </nav>
  );
}
