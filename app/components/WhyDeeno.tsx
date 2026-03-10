"use client";

const differentiators = [
  {
    title: "We only do trades.",
    body: "Not 24 industries. Two: HVAC and roofing. That specialization is how we outperform agencies serving everyone.",
  },
  {
    title: "We run the campaigns.",
    body: "Full SDR service — not strategy decks. We do the outreach, handle replies, and book the meetings.",
  },
  {
    title: "1 client per market.",
    body: "Your competitors won't find us working in your territory. When your market is claimed, it's closed.",
  },
  {
    title: "Founder-led, not call center.",
    body: "You work directly with someone who's closed SaaS deals, run outbound campaigns, and acquired a trades business.",
  },
  {
    title: "AI-assisted outreach.",
    body: "Personalized at scale. Not the same template blasted to 10,000 people — real research, real context, real replies.",
  },
];

export default function WhyDeeno() {
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
            Why Deeno
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
            ACTUALLY<br />
            <span style={{ color: "#E8FF47" }}>DIFFERENT.</span>
          </h2>
        </div>

        {/* Differentiator list */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            background: "#2A2A2A",
            border: "1px solid #2A2A2A",
          }}
        >
          {differentiators.map((d, i) => (
            <div
              key={i}
              style={{
                background: "#111111",
                padding: "28px 36px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 40,
                alignItems: "center",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "#161616")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "#111111")}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#F5F5F2",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 11,
                    color: "#E8FF47",
                    flexShrink: 0,
                  }}
                >
                  →
                </span>
                {d.title}
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: "#666",
                  lineHeight: 1.6,
                }}
              >
                {d.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
