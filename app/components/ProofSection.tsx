"use client";

// Proof section — guarantee band + social proof
const differentiators = [
  { stat: "1", label: "Client per market", sub: "Your territory. Exclusive." },
  { stat: "10", label: "Meetings guaranteed", sub: "In first 90 days or we keep working." },
  { stat: "30", label: "Days to first meeting", sub: "Most clients see results within month one." },
  { stat: "100%", label: "Commercial focus", sub: "Not homeowner leads. Never." },
];

export default function ProofSection() {
  return (
    <section id="proof" style={{ background: "#111111", borderBottom: "1px solid #2A2A2A" }}>
      {/* Guarantee band */}
      <div
        style={{
          background: "#E8FF47",
          padding: "60px 40px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Watermark */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            right: -20,
            top: "50%",
            transform: "translateY(-50%)",
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(80px, 14vw, 200px)",
            color: "rgba(0,0,0,0.04)",
            letterSpacing: "8px",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            userSelect: "none",
            lineHeight: 1,
          }}
        >
          GUARANTEED
        </div>

        <div style={{ maxWidth: "1200px", margin: "0 auto", position: "relative" }}>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              letterSpacing: "3px",
              textTransform: "uppercase",
              color: "rgba(0,0,0,0.4)",
              marginBottom: 20,
            }}
          >
            The Guarantee
          </div>
          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(42px, 6vw, 80px)",
              letterSpacing: "2px",
              color: "#0A0A0A",
              lineHeight: 0.95,
              marginBottom: 20,
              maxWidth: 800,
            }}
          >
            10 QUALIFIED COMMERCIAL MEETINGS IN 90 DAYS — OR WE KEEP WORKING.
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "rgba(0,0,0,0.5)",
              maxWidth: 560,
              lineHeight: 1.6,
              marginBottom: 28,
            }}
          >
            No extra charge. No excuses. We hit the number or we stay at the table until we do.
          </p>
          <a
            href="#contact"
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              letterSpacing: "1.5px",
              padding: "14px 28px",
              background: "#0A0A0A",
              color: "#E8FF47",
              textDecoration: "none",
              fontWeight: 500,
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.85")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")}
          >
            CHECK MY MARKET&apos;S AVAILABILITY →
          </a>
        </div>
      </div>

      {/* Stats strip */}
      <div
        style={{
          background: "#0A0A0A",
          borderBottom: "1px solid #2A2A2A",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 1,
            background: "#2A2A2A",
            border: "1px solid #2A2A2A",
            borderTop: "none",
          }}
        >
          {differentiators.map((d, i) => (
            <div
              key={i}
              style={{
                background: "#0A0A0A",
                padding: "36px 32px",
              }}
            >
              <div
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "clamp(48px, 6vw, 72px)",
                  color: "#E8FF47",
                  letterSpacing: "2px",
                  lineHeight: 1,
                  marginBottom: 8,
                }}
              >
                {d.stat}
              </div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#F5F5F2",
                  marginBottom: 4,
                }}
              >
                {d.label}
              </div>
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 11,
                  color: "#444",
                  letterSpacing: "0.5px",
                }}
              >
                {d.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Case study preview */}
      <div style={{ padding: "64px 40px", background: "#111111" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: "#E8FF47",
              letterSpacing: "3px",
              textTransform: "uppercase",
              marginBottom: 32,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ display: "block", width: 32, height: 1, background: "#E8FF47" }} />
            Client Proof — Real campaigns. Real results.
          </div>

          <div
            style={{
              background: "#161616",
              border: "1px solid #2A2A2A",
              borderLeft: "3px solid #E8FF47",
              padding: "40px",
            }}
          >
            <div style={{ display: "flex", gap: 40, flexWrap: "wrap", alignItems: "flex-start" }}>
              <div style={{ flex: "1 1 300px" }}>
                <div
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 9,
                    letterSpacing: "2px",
                    textTransform: "uppercase",
                    color: "#444",
                    marginBottom: 12,
                  }}
                >
                  Long Island, NY · Commercial HVAC
                </div>
                <h3
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 36,
                    letterSpacing: "2px",
                    color: "#F5F5F2",
                    lineHeight: 1,
                    marginBottom: 16,
                  }}
                >
                  MD HEATING & AIR
                </h3>
                <p style={{ fontSize: 14, color: "#666", lineHeight: 1.7, maxWidth: 440 }}>
                  A residential HVAC contractor with zero commercial pipeline. Goal: land facility management companies and property managers in Nassau and Suffolk County. We built their commercial ICP, launched cold email sequences targeting facility directors, and ran LinkedIn outreach to property management companies across the market.
                </p>
              </div>
              <div
                style={{
                  flex: "1 1 200px",
                  background: "#1C1C1C",
                  padding: "28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                }}
              >
                <div>
                  <div
                    style={{
                      fontFamily: "'Bebas Neue', sans-serif",
                      fontSize: 48,
                      color: "#E8FF47",
                      lineHeight: 1,
                    }}
                  >
                    ACTIVE
                  </div>
                  <div
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 10,
                      letterSpacing: "1.5px",
                      color: "#444",
                      textTransform: "uppercase",
                    }}
                  >
                    Campaign Status
                  </div>
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: "#666",
                    lineHeight: 1.6,
                    fontStyle: "italic",
                  }}
                >
                  &ldquo;First meetings booked within 30 days. The facility managers we&apos;re talking to are exactly who we wanted to reach.&rdquo;
                </p>
                <a
                  href="#contact"
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 10,
                    letterSpacing: "1.5px",
                    color: "#E8FF47",
                    textDecoration: "none",
                    textTransform: "uppercase",
                  }}
                >
                  GET THE SAME FOR YOUR MARKET →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
