"use client";

import { useState } from "react";

const verticals = [
  { title: "HVAC", image: "/hvac.png", href: "/commercial-hvac", bg: "#1C2B2B" },
  { title: "Commercial Cleaning", image: null, href: "#contact", bg: "#1A2535" },
  { title: "Tree Care", image: null, href: "#contact", bg: "#1A3020" },
  { title: "Waste Management", image: null, href: "#contact", bg: "#252520" },
  { title: "Landscaping", image: null, href: "/commercial-landscaping", bg: "#2D5A3D" },
  { title: "Pest Control", image: "/pest-removal.png", href: "/commercial-pest-control", bg: "#1C2B2B" },
  { title: "Plumbing", image: "/plumbing.png", href: "/commercial-plumbing", bg: "#1C2B2B" },
  { title: "Roofing", image: "/roofing.png", href: "#contact", bg: "#1C2B2B" },
];

export default function IndustrySelector() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section
      id="industries"
      className="rsp-industry-section"
      style={{
        minHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        background: "#1C2B2B",
        overflow: "hidden",
      }}
    >
      {/* Section header */}
      <div style={{ padding: "40px 40px 20px" }}>
        <h2
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(52px, 8vw, 110px)",
            color: "#FFFFFF",
            letterSpacing: "3px",
            lineHeight: 1,
            marginBottom: 8,
          }}
        >
          YOUR INDUSTRY.
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.50)",
            fontSize: 12,
            fontFamily: "'DM Mono', monospace",
            letterSpacing: "2.5px",
            textTransform: "uppercase",
          }}
        >
          One client. One market. First to claim it closes the territory.
        </p>
      </div>

      {/* 2×4 grid */}
      <div
        className="rsp-industry-cards"
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridTemplateRows: "repeat(2, 1fr)",
          gap: 6,
          padding: "0 6px 6px",
        }}
      >
        {verticals.map((v, i) => (
          <a
            key={i}
            href={v.href}
            className="rsp-industry-card"
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 10,
              textDecoration: "none",
              cursor: "pointer",
              background: v.bg,
              minHeight: 160,
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Background image */}
            {v.image && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url(${v.image})`,
                  backgroundSize: "contain",
                  backgroundPosition: "center bottom",
                  backgroundRepeat: "no-repeat",
                  opacity: hovered === i ? 1 : 0.85,
                  transition: "opacity 0.35s ease",
                }}
              />
            )}

            {/* Dark gradient overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  hovered === i
                    ? "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.40) 55%, rgba(0,0,0,0.78) 100%)"
                    : "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.88) 100%)",
                transition: "background 0.35s ease",
              }}
            />

            {/* Industry name */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "16px 18px",
              }}
            >
              <h3
                style={{
                  fontFamily: "'DM Sans Variable', 'DM Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(14px, 1.4vw, 20px)",
                  color: "#FFFFFF",
                  lineHeight: 1.2,
                  textShadow: "0 1px 8px rgba(0,0,0,0.6)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {v.title}
              </h3>
              {/* Amber underline on hover */}
              <div
                style={{
                  height: 2,
                  background: "#E8A020",
                  marginTop: 6,
                  width: hovered === i ? "40px" : "0px",
                  transition: "width 0.35s ease 0.05s",
                }}
              />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
