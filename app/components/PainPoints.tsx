"use client";

const pains = [
  {
    problem: "Your pipeline dies between referrals.",
    solution: "We build you an outbound machine that runs whether you're on a job or not.",
  },
  {
    problem: "You want commercial accounts but you can't crack facility managers.",
    solution: "We get you in front of them — with the right context and the right timing.",
  },
  {
    problem: "You tried a marketing agency. They didn't get trades.",
    solution: "We only do trades. Six of them. Nothing else.",
  },
  {
    problem: "You don't have time to run your own cold outreach.",
    solution: "We run it for you. Fully managed. Your only job is to show up and close.",
  },
];

export default function PainPoints() {
  return (
    <section
      style={{
        background: "#EEE9DF",
        borderBottom: "1px solid #C8C1B3",
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
              fontSize: "clamp(42px, 6vw, 72px)",
              letterSpacing: "2px",
              color: "#1C2B2B",
              lineHeight: 0.95,
            }}
          >
            We know this situation.
          </h2>
        </div>

        {/* Pain cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 1,
            background: "#C8C1B3",
            border: "1px solid #C8C1B3",
          }}
        >
          {pains.map((item, i) => (
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
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#1C2B2B",
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
                    color: "#E8A020",
                    flexShrink: 0,
                    lineHeight: 1.5,
                  }}
                >
                  →
                </span>
                <p style={{ fontSize: 14, color: "#8C8070", lineHeight: 1.6 }}>
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
