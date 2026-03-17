export default function EssentialSection() {
  return (
    <section
      style={{
        background: "#1C1C1E",
        padding: "100px 40px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        <h2
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(40px, 6vw, 80px)",
            color: "#F7F4EE",
            lineHeight: 1.05,
            letterSpacing: "1.5px",
            marginBottom: 40,
          }}
        >
          On a slow Tuesday, when your guys are texting you for work—
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, fontSize: 18, lineHeight: 1.8 }}>
          <p style={{ color: "rgba(247,244,238,0.75)" }}>
            the last thing you want is an empty calendar.
          </p>
          <p style={{ color: "rgba(247,244,238,0.75)" }}>
            The guys getting the commercial contracts aren&apos;t better operators than you. They just got in front of the right people first.
          </p>
          <p style={{
            color: "#E8A020",
            fontFamily: "'DM Mono', monospace",
            fontSize: 15,
            letterSpacing: "0.5px",
            paddingTop: 8,
          }}>
            Getting you in front of those people — that&apos;s what we do.
          </p>
        </div>
      </div>
    </section>
  );
}
