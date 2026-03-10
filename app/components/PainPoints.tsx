"use client";

const pains = [
  {
    problem: "Your pipeline dies between referrals.",
    solution: "We build you an outbound machine that runs 24/7.",
  },
  {
    problem: "You want commercial accounts but can't crack facility managers.",
    solution: "We get you in front of them — with context and timing.",
  },
  {
    problem: "You tried an SEO agency. They didn't get trades.",
    solution: "We only do trades. HVAC and roofing. That's it.",
  },
  {
    problem: "You don't have time to do your own cold outreach.",
    solution: "We do it for you. Fully managed. You just close the deals.",
  },
];

export default function PainPoints() {
  return (
    <section
      style={{
        background: "#111111",
        borderBottom: "1px solid #2A2A2A",
        padding: "80px 40px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 56 }}>
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
            Sound Familiar?
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
            WE KNOW YOUR<br />
            <span style={{ color: "#E8FF47" }}>EXACT SITUATION.</span>
          </h2>
        </div>

        {/* Pain cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 1,
            background: "#2A2A2A",
            border: "1px solid #2A2A2A",
          }}
        >
          {pains.map((item, i) => (
            <div
              key={i}
              style={{
                background: "#161616",
                padding: "32px 28px",
                borderLeft: "3px solid #E8FF47",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "#1C1C1C")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "#161616")}
            >
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#F5F5F2",
                  lineHeight: 1.5,
                  marginBottom: 16,
                }}
              >
                &ldquo;{item.problem}&rdquo;
              </p>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 14,
                    color: "#E8FF47",
                    flexShrink: 0,
                    lineHeight: 1.5,
                  }}
                >
                  →
                </span>
                <p style={{ fontSize: 14, color: "#999", lineHeight: 1.6 }}>
                  {item.solution}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
