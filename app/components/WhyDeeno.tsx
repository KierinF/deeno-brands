"use client";

const differentiators = [
  {
    title: "Founder-led, not a call center.",
    body: "You work directly with someone who has closed SaaS deals, run outbound campaigns, and acquired a trades business. Not a rep reading a script. Someone who has sat where you're sitting.",
  },
  {
    title: "We only work with essential service businesses.",
    body: "Not SaaS. Not e-commerce. The operators who show up with crews and get paid when the work is done. We know your buyers — facility managers, property managers, GCs — better than any generalist because we've never worked with anyone else.",
  },
  {
    title: "One client per market.",
    body: "When your territory is claimed it's closed. We will never work with your competitor in your geography. That's not a policy — it's the whole model.",
  },
  {
    title: "We run the campaigns.",
    body: "Full SDR service. We write the emails, send them, handle every reply, and book the meetings. You don't get a strategy deck. You get a booked calendar.",
  },
  {
    title: "AI-assisted and personally managed.",
    body: "We use AI to personalize outreach at scale — real research, real context, real replies. Not the same template blasted to 10,000 people. Every sequence is built for your industry and your specific market.",
  },
];

export default function WhyDeeno() {
  return (
    <section
      style={{
        background: "#F7F4EE",
        borderBottom: "1px solid #C8C1B3",
        padding: "80px 40px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
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
            Why operators who&apos;ve been burned before still book the call.
          </div>
        </div>

        {/* Differentiator list */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            background: "#C8C1B3",
            border: "1px solid #C8C1B3",
          }}
        >
          {differentiators.map((d, i) => (
            <div
              key={i}
              className="rsp-why-row"
              style={{
                background: "#EEE9DF",
                padding: "28px 36px",
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 40,
                alignItems: "center",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = "#E4DDD1")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = "#EEE9DF")}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#1C2B2B",
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 11,
                    color: "#E8A020",
                    flexShrink: 0,
                  }}
                >
                  →
                </span>
                {d.title}
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: "#8C8070",
                  lineHeight: 1.6,
                }}
              >
                {d.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
