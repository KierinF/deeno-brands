"use client";

const stats = [
  { value: "1", label: "Client per trade per market" },
  { value: "30", label: "Days free if we miss our agreed target" },
  { value: "90", label: "Days to a proven system. No lock in after that" },
];

export default function GuaranteeSection() {
  return (
    <section
      style={{
        background: "#1C2B2B",
        padding: "100px 40px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: 64 }}>
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
            Our commitment
          </div>
          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(48px, 7vw, 88px)",
              color: "#F7F4EE",
              lineHeight: 0.95,
              letterSpacing: "2px",
              marginBottom: 48,
            }}
          >
            The Deeno Guarantee.
          </h2>
          <div style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: 20, fontSize: 17, lineHeight: 1.8 }}>
            <p style={{ color: "rgba(247,244,238,0.85)", fontWeight: 500 }}>
              Before we start we agree on a number. A specific written number of qualified meetings with real decision makers at the kinds of accounts you actually want to close.
            </p>
            <p style={{ color: "rgba(247,244,238,0.75)" }}>
              If we don&apos;t hit the number by end of month three we don&apos;t send another invoice. We extend at no charge for thirty days and keep working until we hit it.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <p style={{ color: "#F7F4EE", fontWeight: 700 }}>No renegotiations. No excuses.</p>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: "#E8A020", letterSpacing: "0.5px" }}>
                The number we shook hands on, delivered.
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
            background: "rgba(247,244,238,0.06)",
            border: "1px solid rgba(247,244,238,0.06)",
            marginBottom: 48,
          }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              style={{
                padding: "36px 28px",
                borderRight: i < 2 ? "1px solid rgba(247,244,238,0.06)" : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "clamp(32px, 3.5vw, 52px)",
                  color: "#E8A020",
                  lineHeight: 1,
                  marginBottom: 12,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 11,
                  color: "rgba(247,244,238,0.6)",
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  lineHeight: 1.5,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <a
          href="#contact"
          style={{
            fontFamily: "'DM Mono', monospace",
            fontSize: 12,
            letterSpacing: "1.5px",
            padding: "16px 32px",
            background: "transparent",
            color: "#F7F4EE",
            textDecoration: "none",
            border: "1px solid rgba(247,244,238,0.3)",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            transition: "border-color 0.2s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(247,244,238,0.7)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(247,244,238,0.3)"; }}
        >
          CHECK MY MARKET&apos;S AVAILABILITY →
        </a>
      </div>
    </section>
  );
}
