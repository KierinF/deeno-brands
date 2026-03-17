export default function ClarityBlock() {
  const pillars = [
    {
      label: "What we do",
      body: "Research your market, build your campaigns, run the outreach, handle every reply, and book meetings directly onto your calendar.",
      large: false,
    },
    {
      label: "What you do",
      body: "Show up. Close.",
      large: true,
    },
    {
      label: "What happens if we miss",
      body: "We work free until we hit the number we agreed to.",
      large: false,
    },
  ];

  return (
    <section style={{ background: "#1C1C1E", padding: "100px 40px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 11,
            color: "#E8A020",
            letterSpacing: "3px",
            textTransform: "uppercase",
            marginBottom: 56,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ display: "block", width: 32, height: 1, background: "#E8A020" }} />
          What Deeno actually is
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
            background: "rgba(247,244,238,0.08)",
            border: "1px solid rgba(247,244,238,0.08)",
            marginBottom: 56,
          }}
        >
          {pillars.map((item, i) => (
            <div
              key={i}
              style={{
                padding: "48px 40px",
                borderRight: i < 2 ? "1px solid rgba(247,244,238,0.08)" : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  color: "#E8A020",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  marginBottom: 20,
                }}
              >
                {item.label}
              </div>
              <p
                style={{
                  fontSize: item.large ? 24 : 16,
                  fontWeight: item.large ? 700 : 400,
                  color: item.large ? "#F7F4EE" : "rgba(247,244,238,0.7)",
                  lineHeight: 1.6,
                }}
              >
                {item.body}
              </p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          <span style={{ display: "block", width: 24, height: 1, background: "rgba(247,244,238,0.15)" }} />
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: "rgba(247,244,238,0.35)",
              letterSpacing: "0.5px",
            }}
          >
            One client per trade per market.
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
          <a
            href="#contact"
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              letterSpacing: "1.5px",
              padding: "16px 32px",
              background: "#E8A020",
              color: "#1C1C1E",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#F0AA30")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#E8A020")}
          >
            BOOK MY FREE PIPELINE AUDIT →
          </a>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "rgba(247,244,238,0.35)" }}>
            Most clients see their first meeting within 30 days.
          </span>
        </div>
      </div>
    </section>
  );
}
