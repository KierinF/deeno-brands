"use client";

import { useState } from "react";

const verticals = [
  { title: "HVAC", image: "/hvac.png", href: "/commercial-hvac", bg: "#1C2B2B" },
  { title: "Commercial Cleaning", image: "/commercial-cleaning.png", href: "/commercial-cleaning", bg: "#1A2535" },
  { title: "Tree Care", image: null, href: "/commercial-tree-care", bg: "#1A3020" },
  { title: "Waste Management", image: "/waste-management.png", href: "/commercial-waste-management", bg: "#252520" },
  { title: "Landscaping", image: "/landscaping.png", href: "/commercial-landscaping", bg: "#2D5A3D" },
  { title: "Pest Control", image: "/pest-removal.png", href: "/commercial-pest-control", bg: "#1C2B2B" },
  { title: "Plumbing", image: "/plumbing.png", href: "/commercial-plumbing", bg: "#1C2B2B" },
  { title: "Roofing", image: "/roofing.png", href: "/commercial-roofing", bg: "#1C2B2B" },
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
        position: "relative",
      }}
    >
      {/* Subtle USA flag-inspired decoration — stripes wash + star field */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 280,
          pointerEvents: "none",
          backgroundImage:
            "repeating-linear-gradient(to bottom, rgba(183,28,28,0.06) 0px, rgba(183,28,28,0.06) 14px, transparent 14px, transparent 28px)",
          maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0))",
          WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0))",
        }}
      />
      <svg
        aria-hidden
        viewBox="0 0 260 140"
        style={{
          position: "absolute",
          top: 36,
          right: 40,
          width: 220,
          height: 120,
          opacity: 0.09,
          pointerEvents: "none",
        }}
      >
        <rect x="0" y="0" width="260" height="140" fill="#1a3a7a" rx="2" />
        {Array.from({ length: 5 }).flatMap((_, row) =>
          Array.from({ length: 6 }).map((_, col) => (
            <circle
              key={`${row}-${col}`}
              cx={20 + col * 40}
              cy={18 + row * 26}
              r={2.6}
              fill="#F7F4EE"
            />
          ))
        )}
      </svg>

      {/* Section header */}
      <div style={{ padding: "40px 40px 20px", position: "relative", zIndex: 1 }}>
        <h2
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(40px, 5.5vw, 84px)",
            color: "#FFFFFF",
            letterSpacing: "2px",
            lineHeight: 1,
            marginBottom: 12,
            maxWidth: 1100,
          }}
        >
          We Work With Businesses That Keep America Running.
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
          position: "relative",
          zIndex: 1,
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
