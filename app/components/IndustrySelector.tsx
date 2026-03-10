"use client";

import { useState } from "react";

const verticals = [
  {
    title: "COMMERCIAL\nHVAC",
    sub: "Facility managers. Service contracts. Multi-site accounts.",
    buyers: ["Facility Managers", "Property Mgmt Companies", "Commercial Real Estate", "Multi-Location Operators"],
    color: "#47A8FF",
    href: "#contact",
  },
  {
    title: "COMMERCIAL\nROOFING",
    sub: "Property owners. GCs. TPO/EPDM/flat roof work.",
    buyers: ["Property Owners", "General Contractors", "Commercial Developers", "Property Mgmt Companies"],
    color: "#E8FF47",
    href: "#contact",
  },
  {
    title: "OTHER\nTRADES",
    sub: "Plumbing, electrical, landscaping, and more. Ask us.",
    buyers: ["Facility Directors", "Commercial Operators", "Property Managers", "GC Networks"],
    color: "#FF8C47",
    href: "#contact",
  },
];

export default function IndustrySelector() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section
      style={{
        background: "#0A0A0A",
        borderBottom: "1px solid #2A2A2A",
        padding: "80px 40px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: "#E8FF47",
              letterSpacing: "3px",
              textTransform: "uppercase",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ display: "block", width: 32, height: 1, background: "#E8FF47" }} />
            Who We Serve
          </div>
          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(42px, 6vw, 72px)",
              letterSpacing: "2px",
              color: "#F5F5F2",
              lineHeight: 0.95,
            }}
          >
            SELECT YOUR<br />
            <span style={{ color: "#E8FF47" }}>TRADE.</span>
          </h2>
        </div>

        {/* Vertical cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
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
                padding: "40px 32px",
                textDecoration: "none",
                display: "flex",
                flexDirection: "column",
                gap: 20,
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
                  fontSize: "clamp(36px, 4vw, 52px)",
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
                }}
              >
                {v.sub}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: "auto" }}>
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 9,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "#444",
                  }}
                >
                  We reach:
                </span>
                {v.buyers.map((b) => (
                  <div
                    key={b}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13,
                      color: "#999",
                    }}
                  >
                    <span style={{ color: v.color, fontSize: 10 }}>→</span>
                    {b}
                  </div>
                ))}
              </div>
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 11,
                  letterSpacing: "1.5px",
                  color: v.color,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginTop: 8,
                  opacity: hovered === i ? 1 : 0,
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
