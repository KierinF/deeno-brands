export default function ProofSection() {
  return (
    <section style={{ background: "#F7F4EE", borderBottom: "1px solid #C8C1B3", padding: "80px 40px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ maxWidth: 760 }}>
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
            Results
          </div>
          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(42px, 6vw, 72px)",
              letterSpacing: "2px",
              color: "#1C2B2B",
              lineHeight: 0.95,
              marginBottom: 40,
            }}
          >
            The operators who move first,<br />
            <span style={{ color: "#E8A020" }}>own the market.</span>
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 20, fontSize: 16, lineHeight: 1.75 }}>
            <p style={{ color: "#8C8070" }}>We take one client per trade per territory.</p>
            <p style={{ color: "#8C8070" }}>
              The campaigns running now are locking up markets that won&apos;t be available next month.
            </p>
            <p style={{ color: "#8C8070" }}>
              When your territory closes, the operator who claimed it has a pipeline partner their competitors don&apos;t.
            </p>
            <p style={{ color: "#1C2B2B", fontWeight: 600, fontSize: 17 }}>
              That&apos;s not a consolation prize for moving early. It&apos;s the whole model.
            </p>
          </div>
          <p
            style={{
              marginTop: 40,
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: "#8C8070",
              lineHeight: 1.7,
            }}
          >
            Results from active campaigns are published as they&apos;re confirmed.{" "}
            <a href="#contact" style={{ color: "#E8A020", textDecoration: "none" }}>Ask us on the audit call</a>
            {" "}what current campaigns are producing.
          </p>
        </div>
      </div>
    </section>
  );
}
