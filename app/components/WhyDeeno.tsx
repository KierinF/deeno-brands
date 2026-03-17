const reasons = [
  {
    title: "→ One operator talking to another.",
    body: "You work directly with someone who has run outbound campaigns, acquired a trades business, and sat across the table from the same facility managers you're trying to reach.",
    closing: "Not a junior rep reading a script. Not an account manager handling forty clients.",
  },
  {
    title: "→ We’ve never worked outside of trades.",
    body: "We’ve never had to learn your buyers from scratch because we’ve never worked with anyone else.",
    closing: "We know what facility managers care about, what objections your buyers raise, and what it takes to close a commercial contract in your trade.",
  },
  {
    title: "→ When your territory is claimed, we say no to your competitors.",
    body: "Operators in your trade, in your geography, come asking.",
    closing: "We turn them down. Every time. Your market is yours for the length of the relationship.",
  },
  {
    title: "→ We run the campaigns.",
    body: "You don’t get a strategy deck and a handshake. You get a fully managed outbound operation — research, copy, sending, reply handling, and booking — all done for you.",
    closing: "Your job is to close the meetings we put in front of you.",
  },
  {
    title: "→ AI-assisted. Personally managed.",
    body: "We use AI to personalize outreach at scale — real company research, real context, real first lines. Not the same template blasted to ten thousand people.",
    closing: "But every campaign is overseen by someone whose name is on the results.",
  },
];

export default function WhyDeeno() {
  return (
    <section style={{ background: "#EEE9DF", borderBottom: "1px solid #C8C1B3", padding: "80px 40px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
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
            Why us
          </div>
          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(36px, 5vw, 64px)",
              letterSpacing: "2px",
              color: "#1C2B2B",
              lineHeight: 0.95,
            }}
          >
            Why operators who&apos;ve been burned<br />
            <span style={{ color: "#E8A020" }}>before still book the call.</span>
          </h2>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            background: "#C8C1B3",
            border: "1px solid #C8C1B3",
          }}
        >
          {reasons.map((r, i) => (
            <div
              key={i}
              style={{
                background: "#F7F4EE",
                padding: "36px 40px",
                display: "grid",
                gridTemplateColumns: "5fr 7fr",
                gap: 48,
                alignItems: "start",
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1C2B2B", lineHeight: 1.3 }}>
                {r.title}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <p style={{ fontSize: 14, color: "#8C8070", lineHeight: 1.75 }}>{r.body}</p>
                <p style={{ fontSize: 14, color: "#1C2B2B", fontWeight: 500, lineHeight: 1.6 }}>{r.closing}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
