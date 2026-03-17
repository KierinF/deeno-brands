export default function FounderSection() {
  return (
    <section
      style={{
        background: "#F7F4EE",
        padding: "100px 40px",
        borderBottom: "1px solid #C8C1B3",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          className="rsp-founder-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "80px",
            alignItems: "start",
          }}
        >
          {/* Left: eyebrow + headline + photo */}
          <div>
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
              From the founder
            </div>
            <h2
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(36px, 5vw, 64px)",
                letterSpacing: "2px",
                color: "#1C2B2B",
                lineHeight: 0.95,
                marginBottom: 40,
              }}
            >
              I built this because I kept<br />
              <span style={{ color: "#E8A020" }}>seeing the same problem.</span>
            </h2>
            <div
              style={{
                width: "100%",
                aspectRatio: "4 / 3",
                background: "#EEE9DF",
                border: "1px solid #C8C1B3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 10,
                  color: "#C8C1B3",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                }}
              >
                Photo — Kierin
              </span>
            </div>
          </div>

          {/* Right: copy */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20, color: "#8C8070", fontSize: 16, lineHeight: 1.85 }}>
            <p>I kept watching good operators get taken by bad agencies.</p>
            <p>
              Operators who ran excellent businesses — handing money to agencies that couldn&apos;t tell a facility manager from a property manager.
            </p>
            <p>
              I&apos;ve sat across the table from facility managers. I&apos;ve run the campaigns. I&apos;ve acquired a trades business and tried to fill its commercial calendar myself — which is exactly how I learned what doesn&apos;t work.
            </p>
            <p>
              I built Deeno for the operator I kept meeting — the one who runs a tight ship and just needs someone to fill the other side of the calendar.
            </p>
            <p style={{ color: "#1C2B2B", fontWeight: 600, fontSize: 17, marginTop: 8 }}>
              That&apos;s the only client we take.
            </p>
            <div style={{ marginTop: 12, paddingTop: 20, borderTop: "1px solid #C8C1B3" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#8C8070", letterSpacing: "1px" }}>
                — Kierin, Founder
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
