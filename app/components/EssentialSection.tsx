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
          On a slow Tuesday when your guys are texting you asking if there&apos;s work —
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 24, fontSize: 18, lineHeight: 1.8 }}>
          <p style={{ color: "rgba(247,244,238,0.75)" }}>
            That&apos;s not a slow market. That&apos;s not bad luck. That&apos;s what a business looks like that can&apos;t run in the background finding the next job while you&apos;re busy working the current one.
          </p>
          <p style={{ color: "rgba(247,244,238,0.75)" }}>
            The moment you stop pushing it slows down. You built something real and somewhere along the way it became a trap.
          </p>
          <p style={{
            color: "#E8A020",
            fontFamily: "'DM Mono', monospace",
            fontSize: 15,
            letterSpacing: "0.5px",
            paddingTop: 8,
          }}>
            You keep America running. You shouldn&apos;t have to wonder where the next job is coming from.
          </p>
        </div>
      </div>
    </section>
  );
}
