"use client";

import { useState } from "react";

const objections = [
  {
    label: '"Your pipeline dies between referrals."',
    body: [
      "Referrals are trust transferred from one person to another. They work — until the network runs dry or the pace of growth outstrips the pace of introductions.",
    ],
    closing: "Outbound isn't a replacement for referrals. It's what keeps the calendar filling while you're on the job.",
  },
  {
    label: '"You want commercial accounts but can\'t get in front of facility managers."',
    body: [
      "Facility managers are not hard to reach.",
      "They're hard to reach cold, from an unknown number, without context, at the wrong time.",
    ],
    closing: "We reach them through structured campaigns. By the time they're on your calendar, they already know who you are and why they agreed to the call.",
  },
  {
    label: '"You tried an agency. They didn\'t understand your business."',
    body: [
      "Most agencies learn your industry by asking you about it — which means you're paying them to get educated on your dime.",
      "We've never worked outside of trades businesses.",
      "We know what facility managers care about, what objections your buyers raise, and what it takes to close a commercial contract in your trade.",
    ],
    closing: "You don't explain anything to us. We already know.",
  },
  {
    label: '"You don\'t have bandwidth to run outbound."',
    body: [
      "You're running a business with real crews, real clients, and real operational demands.",
      "Building and managing a commercial outreach system on top of that isn't realistic — and a half-built one is worse than none.",
      "We run the entire operation: research, copy, sending, replies, objection handling, and booking.",
    ],
    closing: "You focus on the work. We handle the pipeline.",
  },
];

export default function ObjectionsSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section style={{ background: "#F7F4EE", borderBottom: "1px solid #C8C1B3", padding: "80px 40px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: 56 }}>
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
            Sound like you?
          </div>
          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(36px, 5vw, 64px)",
              letterSpacing: "2px",
              color: "#1C2B2B",
              lineHeight: 0.95,
            }}
          >
            If you&apos;ve been burned before,<br />
            <span style={{ color: "#E8A020" }}>this is why it happened.</span>
          </h2>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            background: "#C8C1B3",
            border: "1px solid #C8C1B3",
            marginBottom: 48,
          }}
        >
          {objections.map((obj, i) => (
            <div key={i} style={{ background: open === i ? "#EEE9DF" : "#F7F4EE" }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: "100%",
                  padding: "28px 36px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 24,
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 600, color: "#1C2B2B", lineHeight: 1.35, fontStyle: "italic" }}>
                  {obj.label}
                </span>
                <span
                  style={{
                    color: "#E8A020",
                    fontSize: 20,
                    flexShrink: 0,
                    fontFamily: "'DM Mono', monospace",
                    transition: "transform 0.2s",
                    transform: open === i ? "rotate(45deg)" : "none",
                    display: "inline-block",
                  }}
                >
                  +
                </span>
              </button>
              {open === i && (
                <div style={{ padding: "0 36px 32px", display: "flex", flexDirection: "column", gap: 14 }}>
                  {obj.body.map((p, j) => (
                    <p key={j} style={{ fontSize: 15, color: "#8C8070", lineHeight: 1.75, maxWidth: 680 }}>
                      {p}
                    </p>
                  ))}
                  <p
                    style={{
                      fontSize: 15,
                      color: "#1C2B2B",
                      fontWeight: 600,
                      lineHeight: 1.6,
                      maxWidth: 680,
                      paddingLeft: 12,
                      borderLeft: "2px solid #E8A020",
                      marginTop: 4,
                    }}
                  >
                    {obj.closing}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
          <a
            href="#contact"
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              letterSpacing: "1.5px",
              padding: "14px 28px",
              background: "#1C2B2B",
              color: "#F7F4EE",
              textDecoration: "none",
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#2A3F3F")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#1C2B2B")}
          >
            CHECK IF MY MARKET IS AVAILABLE →
          </a>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#8C8070" }}>
            Your territory may still be open. Once it&apos;s claimed, it&apos;s closed.
          </span>
        </div>
      </div>
    </section>
  );
}
