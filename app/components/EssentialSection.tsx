export default function EssentialSection() {
  return (
    <section
      style={{
        background: "#1C2B2B",
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
            marginBottom: 56,
          }}
        >
          On a slow Tuesday, when your guys are texting you asking what&apos;s next—
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 28, fontSize: 18, lineHeight: 1.8 }}>
          <p style={{ color: "rgba(247,244,238,0.75)" }}>You already know what that means.</p>
          <p style={{ color: "rgba(247,244,238,0.75)" }}>
            You built something real. You run it well. The work is good.
          </p>
          <p style={{ color: "rgba(247,244,238,0.75)" }}>
            What nobody told you is how to get in front of the buyers who could actually change your scale.
          </p>
          <p style={{ color: "#F7F4EE", fontWeight: 600 }}>That&apos;s not your job.</p>
          <p
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 15,
              color: "#E8A020",
              letterSpacing: "1px",
            }}
          >
            It&apos;s ours.
          </p>
        </div>
      </div>
    </section>
  );
}
