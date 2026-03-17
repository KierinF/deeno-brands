"use client";

const stats = [
  { value: "1", label: "Client per market", caption: "Your territory. Exclusive from day one." },
  { value: "Agreed", label: "Meeting target", caption: "Miss it? We work free until we hit it." },
  { value: "30", label: "Days to first meeting", caption: "Most clients see results in week three." },
  { value: "100%", label: "Commercial focus", caption: "Not homeowner leads. Not mixed pipelines. Never." },
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
            The Deeno guarantee.
          </h2>
          <div style={{ maxWidth: 680, display: "flex", flexDirection: "column", gap: 20, fontSize: 17, lineHeight: 1.8 }}>
            <p style={{ color: "rgba(247,244,238,0.85)", fontWeight: 500 }}>
              Before we start, we agree on a specific number of qualified meetings for your contract period.
            </p>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                color: "rgba(247,244,238,0.45)",
                fontStyle: "italic",
                fontSize: 16,
                paddingLeft: 20,
                borderLeft: "1px solid rgba(247,244,238,0.12)",
              }}
            >
              <p>Not leads.</p>
              <p>Not conversations.</p>
              <p>Meetings with the people who can actually sign a commercial contract.</p>
            </div>
            <p style={{ color: "rgba(247,244,238,0.75)" }}>
              If we fall short by the end of your contract, we don&apos;t send another invoice.
            </p>
            <p style={{ color: "#F7F4EE", fontWeight: 600 }}>
              We send more meetings — at no cost — until we hit the number we agreed to.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <p style={{ color: "#F7F4EE", fontWeight: 700 }}>No renegotiations. No excuses.</p>
              <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: "#E8A020", letterSpacing: "0.5px" }}>
                Just the number we shook hands on, delivered.
              </p>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
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
                borderRight: i < 3 ? "1px solid rgba(247,244,238,0.06)" : "none",
              }}
            >
              <div
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "clamp(28px, 3vw, 44px)",
                  color: "#E8A020",
                  lineHeight: 1,
                  marginBottom: 6,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 9,
                  color: "rgba(247,244,238,0.35)",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  marginBottom: 10,
                }}
              >
                {s.label}
              </div>
              <div style={{ fontSize: 12, color: "rgba(247,244,238,0.55)", lineHeight: 1.5 }}>
                {s.caption}
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
