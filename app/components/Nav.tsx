"use client";

import { useState, useEffect } from "react";

const links = [
  { label: "About", href: "/#about" },
  { label: "How It Works", href: "/#process" },
  { label: "Results", href: "/#proof" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const navBg = scrolled ? "rgba(247,244,238,0.96)" : "transparent";

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/#")) {
      const id = href.slice(2);
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

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
        borderBottom: scrolled ? "1px solid #C8C1B3" : "none",
        transition: "background 0.3s ease, border-color 0.3s ease",
      }}
    >
      <div
        className="rsp-nav-inner"
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "20px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <a href="/" style={{ textDecoration: "none" }}>
          <span
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 28,
              letterSpacing: "3px",
              color: "#E8A020",
            }}
          >
            DEENO
          </span>
        </a>

        <div
          className="hidden md:flex"
          style={{ alignItems: "center", gap: 8 }}
        >
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={(e) => handleNavClick(e, l.href)}
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                letterSpacing: "1.5px",
                color: "#8C8070",
                textDecoration: "none",
                padding: "8px 16px",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#1C2B2B")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#8C8070")}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex" style={{ alignItems: "center", gap: 8 }}>
          <a
            href="/client-login"
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              letterSpacing: "1.5px",
              padding: "10px 20px",
              background: "transparent",
              color: "#1C2B2B",
              border: "1px solid #1C2B2B",
              textDecoration: "none",
              fontWeight: 500,
              transition: "background 0.2s, color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "#1C2B2B";
              (e.currentTarget as HTMLAnchorElement).style.color = "#F7F4EE";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
              (e.currentTarget as HTMLAnchorElement).style.color = "#1C2B2B";
            }}
          >
            CLIENT LOGIN
          </a>
          <a
            href="/#contact"
            onClick={(e) => handleNavClick(e, "/#contact")}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              letterSpacing: "1.5px",
              padding: "10px 20px",
              background: "#E8A020",
              color: "#F7F4EE",
              textDecoration: "none",
              fontWeight: 500,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#F0AA30")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#E8A020")}
          >
            CHECK MY MARKET →
          </a>
        </div>

        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          style={{
            background: "none",
            border: "1px solid #C8C1B3",
            color: "#1C2B2B",
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

      {mobileOpen && (
        <div
          style={{
            background: "#F7F4EE",
            borderTop: "1px solid #C8C1B3",
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
              onClick={(e) => { handleNavClick(e, l.href); setMobileOpen(false); }}
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 12,
                letterSpacing: "1.5px",
                color: "#8C8070",
                textDecoration: "none",
              }}
            >
              {l.label}
            </a>
          ))}
          <a
            href="/client-login"
            onClick={() => setMobileOpen(false)}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              letterSpacing: "1.5px",
              padding: "12px 20px",
              border: "1px solid #1C2B2B",
              color: "#1C2B2B",
              textDecoration: "none",
              textAlign: "center",
              fontWeight: 500,
            }}
          >
            CLIENT LOGIN
          </a>
          <a
            href="/#contact"
            onClick={(e) => { handleNavClick(e, "/#contact"); setMobileOpen(false); }}
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              letterSpacing: "1.5px",
              padding: "12px 20px",
              background: "#E8A020",
              color: "#F7F4EE",
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
