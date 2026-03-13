"use client";

import { useState } from "react";

const verticals = [
  { title: "HVAC", image: "/hvac.png", href: "/commercial-hvac" },
  { title: "Electrical", image: "/electrician.png", href: "/commercial-electrical" },
  { title: "Pest Control", image: "/pest-removal.png", href: "/commercial-pest-control" },
  { title: "Plumbing", image: "/plumbing.png", href: "/commercial-plumbing" },
  { title: "Landscaping", image: null, href: "/commercial-landscaping" },
  { title: "Roofing", image: "/roofing.png", href: "#contact" },
];

export default function IndustrySelector() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <section
      id="industries"
      className="rsp-industry-section"
      style={{
        height: "85vh",
        minHeight: 560,
        maxHeight: 880,
        position: "relative",
        overflow: "hidden",
        background: "#1C2B2B",
      }}
    >
      {/* Center overlay text */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          zIndex: 10,
          pointerEvents: "none",
          width: "100%",
          padding: "0 20px",
        }}
      >
        <h2
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(52px, 8vw, 110px)",
            color: "#FFFFFF",
            letterSpacing: "3px",
            textShadow: "0 2px 24px rgba(0,0,0,0.7)",
            lineHeight: 1,
            marginBottom: 12,
          }}
        >
          YOUR TRADE.
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.80)",
            fontSize: "clamp(14px, 1.8vw, 20px)",
            fontFamily: "'DM Sans Variable', 'DM Sans', sans-serif",
            textShadow: "0 2px 12px rgba(0,0,0,0.7)",
            letterSpacing: "1px",
          }}
        >
          Choose your industry.
        </p>
      </div>

      {/* Cards row */}
      <div
        className="rsp-industry-cards"
        style={{
          display: "flex",
          height: "100%",
          gap: 6,
          padding: 6,
        }}
      >
        {verticals.map((v, i) => (
          <a
            key={i}
            href={v.href}
            className="rsp-industry-card"
            style={{
              flex: 1,
              position: "relative",
              overflow: "hidden",
              borderRadius: 14,
              textDecoration: "none",
              cursor: "pointer",
              background: v.image ? "#1C2B2B" : "#2D5A3D",
            }}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            {/* Background image — fixed, no scale */}
            {v.image && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url(${v.image})`,
                  backgroundSize: "contain",
                  backgroundPosition: "center bottom",
                  backgroundRepeat: "no-repeat",
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
                padding: "20px 18px",
              }}
            >
              <h3
                style={{
                  fontFamily: "'DM Sans Variable', 'DM Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(15px, 1.8vw, 24px)",
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
