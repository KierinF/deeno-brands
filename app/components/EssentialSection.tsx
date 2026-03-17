export default function EssentialSection() {
  return (
    <section
      style={{
        background: "#F7F4EE",
        padding: "88px 40px",
        borderBottom: "1px solid #C8C1B3",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h2
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(44px, 6vw, 88px)",
            color: "#1C1C1E",
            lineHeight: 1,
            letterSpacing: "2px",
            marginBottom: 4,
          }}
        >
          You keep the world running.
        </h2>
        <h2
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(44px, 6vw, 88px)",
            color: "#D4820A",
            lineHeight: 1,
            letterSpacing: "2px",
            marginBottom: 40,
          }}
        >
          Nobody&apos;s filling your commercial calendar.
        </h2>
        <p
          style={{
            maxWidth: 600,
            color: "#8C8070",
            fontSize: 17,
            lineHeight: 1.75,
          }}
        >
          The cleaning crews. The waste haulers. The HVAC techs. The arborists.
          Nobody notices when you&apos;re doing your job. Everybody notices when
          you stop. You run excellent operations with capacity to grow. What you
          don&apos;t have is a commercial pipeline. That&apos;s what we do.
        </p>
      </div>
    </section>
  );
}
