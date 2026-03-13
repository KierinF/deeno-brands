"use client";

import { useState } from "react";
import Nav from "./Nav";
import Footer from "./Footer";
import CTA from "./CTA";

export interface Pain {
  problem: string;
  solution: string;
}

export interface Persona {
  title: string;
  desc: string;
}

export interface ProcessStep {
  label: string;
  detail: string;
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface IndustryPageData {
  trade: string;
  image: string;
  headline: string;
  sub: string;
  pains: Pain[];
  personas: Persona[];
  processNote?: string;
  processSteps: ProcessStep[];
  callout?: string;
  faq: FAQItem[];
}

export default function IndustryPage({ data }: { data: IndustryPageData }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Nav />

      {/* ── Hero ── */}
      <section
        className="rsp-hero-pad"
        style={{
          minHeight: "75vh",
          background: "#F7F4EE",
          padding: "120px 40px 80px",
          display: "flex",
          alignItems: "center",
          borderBottom: "1px solid #C8C1B3",
        }}
      >
        <div
          className="rsp-col-1"
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            width: "100%",
            display: "grid",
            gridTemplateColumns: "3fr 2fr",
            gap: 64,
            alignItems: "center",
          }}
        >
          {/* Left: copy */}
          <div>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                color: "#E8A020",
                letterSpacing: "3px",
                textTransform: "uppercase",
                marginBottom: 24,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ display: "block", width: 32, height: 1, background: "#E8A020" }} />
              {data.trade}
            </div>
            <h1
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(38px, 5vw, 72px)",
                letterSpacing: "2px",
                color: "#1C2B2B",
                lineHeight: 1,
                marginBottom: 28,
              }}
            >
              {data.headline}
            </h1>
            <p
              style={{
                fontSize: 16,
                color: "#8C8070",
                lineHeight: 1.75,
                marginBottom: 40,
                maxWidth: 520,
              }}
            >
              {data.sub}
            </p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
              <a
                href="#contact"
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 12,
                  letterSpacing: "1.5px",
                  padding: "14px 28px",
                  background: "#E8A020",
                  color: "#F7F4EE",
                  textDecoration: "none",
                  fontWeight: 500,
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#F0AA30")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#E8A020")}
              >
                BOOK YOUR FREE PIPELINE AUDIT →
              </a>
              <a
                href="/#industries"
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 11,
                  letterSpacing: "1px",
                  color: "#8C8070",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#1C2B2B")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#8C8070")}
              >
                ← All Industries
              </a>
            </div>
          </div>

          {/* Right: trade photo */}
          <div style={{ position: "relative" }}>
            <div
              style={{
                aspectRatio: "1/1",
                overflow: "hidden",
                borderRadius: 10,
                background: "#1C2B2B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={data.image}
                alt={data.trade}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Pain Points ── */}
      <section
        className="rsp-section-pad"
        style={{ background: "#EEE9DF", borderBottom: "1px solid #C8C1B3", padding: "80px 40px" }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: 48 }}>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                color: "#E8A020",
                letterSpacing: "3px",
                textTransform: "uppercase",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ display: "block", width: 32, height: 1, background: "#E8A020" }} />
              Sound Familiar?
            </div>
            <h2
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(36px, 5vw, 60px)",
                letterSpacing: "2px",
                color: "#1C2B2B",
                lineHeight: 0.95,
              }}
            >
              We know this situation.
            </h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 1,
              background: "#C8C1B3",
              border: "1px solid #C8C1B3",
            }}
          >
            {data.pains.map((p, i) => (
              <div
                key={i}
                style={{
                  background: "#F7F4EE",
                  padding: "32px 28px",
                  borderLeft: "3px solid #E8A020",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "#EEE9DF")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "#F7F4EE")}
              >
                <p
                  style={{ fontSize: 15, fontWeight: 600, color: "#1C2B2B", lineHeight: 1.5, marginBottom: 16 }}
                >
                  &ldquo;{p.problem}&rdquo;
                </p>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <span style={{ color: "#E8A020", fontSize: 14, flexShrink: 0, lineHeight: 1.5 }}>→</span>
                  <p style={{ fontSize: 14, color: "#8C8070", lineHeight: 1.6 }}>{p.solution}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who You Reach ── */}
      <section
        className="rsp-section-pad"
        style={{ background: "#F7F4EE", borderBottom: "1px solid #C8C1B3", padding: "80px 40px" }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: 48 }}>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                color: "#E8A020",
                letterSpacing: "3px",
                textTransform: "uppercase",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ display: "block", width: 32, height: 1, background: "#E8A020" }} />
              Who We Contact For You
            </div>
            <h2
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(36px, 5vw, 60px)",
                letterSpacing: "2px",
                color: "#1C2B2B",
                lineHeight: 0.95,
              }}
            >
              The Decision-Makers We Reach.
            </h2>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              background: "#C8C1B3",
              border: "1px solid #C8C1B3",
            }}
          >
            {data.personas.map((p, i) => (
              <div
                key={i}
                className="rsp-persona-row"
                style={{
                  background: "#EEE9DF",
                  padding: "24px 32px",
                  display: "grid",
                  gridTemplateColumns: "minmax(200px, 1fr) 2fr",
                  gap: 32,
                  alignItems: "start",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "#E4DDD1")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "#EEE9DF")}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <span
                    style={{
                      color: "#E8A020",
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 11,
                      marginTop: 3,
                      flexShrink: 0,
                    }}
                  >
                    →
                  </span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#1C2B2B", lineHeight: 1.4 }}>
                    {p.title}
                  </span>
                </div>
                <p style={{ fontSize: 14, color: "#8C8070", lineHeight: 1.6 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Optional Callout ── */}
      {data.callout && (
        <section
          style={{
            background: "#EEE9DF",
            padding: "64px 40px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div style={{ maxWidth: "860px", margin: "0 auto", textAlign: "center" }}>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 10,
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: "rgba(232,160,32,0.55)",
                marginBottom: 20,
              }}
            >
              The Real Opportunity
            </div>
            <p
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(26px, 3.5vw, 44px)",
                color: "#E8A020",
                letterSpacing: "1px",
                lineHeight: 1.25,
              }}
            >
              {data.callout}
            </p>
          </div>
        </section>
      )}

      {/* ── Process ── */}
      <section
        className="rsp-section-pad"
        style={{ background: "#EEE9DF", borderBottom: "1px solid #C8C1B3", padding: "80px 40px" }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: 48 }}>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                color: "#E8A020",
                letterSpacing: "3px",
                textTransform: "uppercase",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ display: "block", width: 32, height: 1, background: "#E8A020" }} />
              How We Work
            </div>
            <h2
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(36px, 5vw, 60px)",
                letterSpacing: "2px",
                color: "#1C2B2B",
                lineHeight: 0.95,
                marginBottom: data.processNote ? 16 : 0,
              }}
            >
              What We Actually Do.
            </h2>
            {data.processNote && (
              <p style={{ fontSize: 15, color: "#8C8070", lineHeight: 1.6, maxWidth: 640 }}>
                {data.processNote}
              </p>
            )}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 1,
              background: "#C8C1B3",
              border: "1px solid #C8C1B3",
            }}
          >
            {data.processSteps.map((step, i) => (
              <div key={i} style={{ background: "#F7F4EE", padding: "32px 28px" }}>
                <div
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 10,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "#E8A020",
                    marginBottom: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "rgba(232,160,32,0.12)",
                      border: "1px solid rgba(232,160,32,0.3)",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 10,
                      color: "#E8A020",
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </span>
                  {step.label}
                </div>
                <p style={{ fontSize: 14, color: "#6B6055", lineHeight: 1.75 }}>{step.detail}</p>
                {i === 1 && (
                  <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {["☎ Cold Calling", "✉ Email", "LinkedIn", "✦ Direct Mail"].map((ch) => (
                      <span
                        key={ch}
                        style={{
                          fontFamily: "'DM Mono', monospace",
                          fontSize: 9,
                          letterSpacing: "1.5px",
                          textTransform: "uppercase",
                          color: "#E8A020",
                          border: "1px solid rgba(232,160,32,0.25)",
                          padding: "3px 8px",
                          background: "rgba(232,160,32,0.06)",
                        }}
                      >
                        {ch}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section
        className="rsp-section-pad"
        style={{ background: "#F7F4EE", borderBottom: "1px solid #C8C1B3", padding: "80px 40px" }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{ marginBottom: 48 }}>
            <div
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 11,
                color: "#E8A020",
                letterSpacing: "3px",
                textTransform: "uppercase",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <span style={{ display: "block", width: 32, height: 1, background: "#E8A020" }} />
              Frequently Asked
            </div>
            <h2
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(36px, 5vw, 60px)",
                letterSpacing: "2px",
                color: "#1C2B2B",
                lineHeight: 0.95,
              }}
            >
              Questions.
            </h2>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              background: "#C8C1B3",
              border: "1px solid #C8C1B3",
            }}
          >
            {data.faq.map((item, i) => (
              <div
                key={i}
                style={{ background: openFaq === i ? "#EEE9DF" : "#F7F4EE", transition: "background 0.2s" }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: "100%",
                    padding: "20px 24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    gap: 16,
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 600, color: "#1C2B2B", lineHeight: 1.4 }}>
                    {item.q}
                  </span>
                  <span
                    style={{
                      color: "#E8A020",
                      fontSize: 20,
                      flexShrink: 0,
                      lineHeight: 1,
                      transform: openFaq === i ? "rotate(45deg)" : "none",
                      transition: "transform 0.2s",
                      display: "block",
                      marginTop: 2,
                    }}
                  >
                    +
                  </span>
                </button>
                {openFaq === i && (
                  <div
                    style={{ padding: "0 24px 20px", fontSize: 14, color: "#8C8070", lineHeight: 1.75 }}
                  >
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTA />
      <Footer />
    </>
  );
}
