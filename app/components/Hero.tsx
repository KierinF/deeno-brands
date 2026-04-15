"use client";

import { useState, useEffect } from "react";

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

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
      <div aria-hidden className="rsp-hide-mobile" style={{
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
      }}>
        PIPELINE
      </div>

      <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>
        <div style={{
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
        }}>
          <span style={{ display: "block", width: 32, height: 1, background: "#E8A020" }} />
          B2B Pipeline Development — Essential Service Businesses
        </div>

        <h1 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(52px, 8vw, 110px)",
          lineHeight: 0.95,
          letterSpacing: "2px",
          color: "#1C2B2B",
          marginBottom: 32,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "none" : "translateY(12px)",
          transition: "opacity 0.5s ease 0.1s, transform 0.5s ease 0.1s",
        }}>
          Your reputation got you here.<br />
          <span style={{ color: "#E8A020" }}>It won&apos;t get you there.</span>
        </h1>

        <p style={{
          maxWidth: 620,
          color: "#8C8070",
          fontSize: 18,
          lineHeight: 1.7,
          marginBottom: 40,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "none" : "translateY(12px)",
          transition: "opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s",
        }}>
          We build the growth engine for businesses that keep America running. We find your next accounts, close them, and keep them. You run the business.
        </p>

        <div style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? "none" : "translateY(12px)",
          transition: "opacity 0.5s ease 0.3s, transform 0.5s ease 0.3s",
          marginBottom: 10,
        }}>
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
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              transition: "background 0.2s, transform 0.2s",
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
            CHECK IF YOUR MARKET IS STILL OPEN →
          </a>
        </div>

        <p style={{
          fontFamily: "'DM Mono', monospace",
          fontSize: 11,
          color: "#8C8070",
          marginBottom: 36,
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.5s ease 0.32s",
        }}>
          We review every submission personally.
        </p>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.5s ease 0.35s",
        }}>
          <span style={{ display: "block", width: 24, height: 1, background: "#C8C1B3" }} />
          <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#8C8070" }}>
            One operator per trade per market. Once your territory is claimed, it&apos;s closed.
          </p>
        </div>
      </div>
    </section>
  );
}
