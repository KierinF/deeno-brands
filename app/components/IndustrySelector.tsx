"use client";

import { useState } from "react";

const verticals = [
  {
    title: "COMMERCIAL\nHVAC",
    sub: "Facility managers. Service contracts. Multi-site accounts.",
    color: "#47A8FF",
    href: "#contact",
  },
  {
    title: "COMMERCIAL\nELECTRICAL",
    sub: "GCs. Developers. Facility directors.",
    color: "#E8FF47",
    href: "#contact",
  },
  {
    title: "COMMERCIAL\nPLUMBING",
    sub: "Property managers. Commercial developers. Maintenance directors.",
    color: "#FF8C47",
    href: "#contact",
  },
  {
    title: "COMMERCIAL\nLANDSCAPING",
    sub: "Property managers. Corporate campuses. HOA management companies.",
    color: "#47FFB2",
    href: "#contact",
  },
  {
    title: "COMMERCIAL\nPEST CONTROL",
    sub: "Property managers. Restaurant groups. Facility operators.",
    color: "#FF47A8",
    href: "#contact",
  },
];

export default function IndustrySelector() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section
      id="industries"
      style={{
        background: "#111111",
        borderBottom: "1px solid #2A2A2A",
        padding: "80px 40px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 48, textAlign: "center" }}>
          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(36px, 5vw, 60px)",
              letterSpacing: "2px",
              color: "#F5F5F2",
              lineHeight: 1,
            }}
          >
            We work in five trades. Pick yours.
          </h2>
        </div>

        {/* Vertical cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 1,
            background: "#2A2A2A",
            border: "1px solid #2A2A2A",
          }}
        >
          {verticals.map((v, i) => (
            <a
              key={i}
              href={v.href}
              style={{
                background: hovered === i ? "#1C1C1C" : "#161616",
                padding: "36px 28px",
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                gap: 16,
                borderBottom: `3px solid ${hovered === i ? v.color : "transparent"}`,
                transition: "background 0.2s, border-color 0.2s",
                cursor: "pointer",
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <h3
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "clamp(28px, 3vw, 40px)",
                  letterSpacing: "2px",
                  color: hovered === i ? v.color : "#F5F5F2",
                  lineHeight: 1,
                  whiteSpace: "pre-line",
                  transition: "color 0.2s",
                }}
              >
                {v.title}
              </h3>
              <p
                style={{
                  fontSize: 13,
                  color: "#666",
                  lineHeight: 1.6,
                  flexGrow: 1,
                }}
              >
                {v.sub}
              </p>
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 11,
                  letterSpacing: "1.5px",
                  color: v.color,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  opacity: hovered === i ? 1 : 0.4,
                  transition: "opacity 0.2s",
                }}
              >
                GET STARTED →
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
