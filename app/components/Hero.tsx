"use client";

import { useState, useEffect } from "react";

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section
      id="hero"
      className="rsp-hero-pad"
      style={{
        minHeight: "100vh",
        background: "#F7F4EE",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "120px 40px 80px",
        position: "relative",
        overflow: "hidden",
        borderBottom: "1px solid #C8C1B3",
      }}
    >
      {/* Background watermark */}
      <div
        aria-hidden
        className="rsp-hide-mobile"
        style={{
          position: "absolute",
          top: "-60px",
          right: "-20px",
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(120px, 18vw, 260px)",
          color: "rgba(232,160,32,0.06)",
          letterSpacing: "10px",
          whiteSpace: "nowrap",
          pointerEvents: "none",
          userSelect: "none",
          lineHeight: 1,
        }}
      >
        PIPELINE
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>
        {/* Eyebrow */}
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            color: "#E8A020",
            letterSpacing: "3px",
            textTransform: "uppercase",
            marginBottom: 28,
            display: "flex",
            alignItems: "center",
            gap: 12,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "none" : "translateY(8px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}
        >
          <span style={{ display: "block", width: 32, height: 1, background: "#E8A020" }} />
          B2B Pipeline Development for Trades Businesses
        </div>

        {/* Headline */}
        <h1
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(56px, 8vw, 110px)",
            lineHeight: 0.95,
            letterSpacing: "2px",
            color: "#1C2B2B",
            marginBottom: 32,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "none" : "translateY(12px)",
            transition: "opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s",
          }}
        >
          Your crews are ready.<br />
          <span style={{ color: "#E8A020" }}>Your commercial</span><br />
          calendar isn&apos;t.
        </h1>

        {/* Subheadline */}
        <p
          style={{
            maxWidth: 560,
            color: "#8C8070",
            fontSize: 17,
            lineHeight: 1.7,
            marginBottom: 48,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "none" : "translateY(12px)",
            transition: "opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s",
          }}
        >
          We contact facility managers, property owners, and GCs in your market on your behalf — and book them on your calendar. Fully managed outreach across cold email, LinkedIn, and phone. You don&apos;t lift a finger.
        </p>

        {/* CTAs */}
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: 24,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "none" : "translateY(12px)",
            transition: "opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s",
          }}
        >
          <a
            href="#contact"
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              letterSpacing: "1.5px",
              padding: "16px 32px",
              background: "#E8A020",
              color: "#F7F4EE",
              textDecoration: "none",
              fontWeight: 500,
              transition: "background 0.2s, transform 0.2s",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "#F0AA30";
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = "#E8A020";
              (e.currentTarget as HTMLAnchorElement).style.transform = "none";
            }}
          >
            BOOK MY FREE PIPELINE AUDIT
          </a>
          <a
            href="#process"
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              letterSpacing: "1.5px",
              padding: "16px 28px",
              background: "transparent",
              color: "#8C8070",
              textDecoration: "none",
              border: "1px solid #C8C1B3",
              transition: "color 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "#1C2B2B";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "#8C8070";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = "#8C8070";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "#C8C1B3";
            }}
          >
            SEE HOW IT WORKS →
          </a>
        </div>

        {/* Trust line */}
        <div
          style={{
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.5s ease 0.35s",
            marginBottom: 48,
          }}
        >
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: "#8C8070",
              letterSpacing: "0.5px",
            }}
          >
            1 client per trade per market. Once your territory is claimed, it&apos;s closed.
          </p>
        </div>
      </div>
    </section>
  );
}
