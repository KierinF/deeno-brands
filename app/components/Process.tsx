"use client";

const steps = [
  {
    num: "01",
    timing: "Week 1",
    title: "Build Your Commercial ICP",
    description:
      "A 90-minute strategy call maps your best commercial clients, ideal contract types, and target geography. We pull a verified contact list from Apollo, Clay, and LinkedIn Sales Navigator. You approve every name before we contact anyone.",
    tags: ["ICP Mapping", "Contact List", "Market Research"],
  },
  {
    num: "02",
    timing: "Week 2",
    title: "Campaign Build",
    description:
      "Cold email sequences written specifically for your trade and your buyers. LinkedIn outreach strategy. Phone scripts and call frameworks. Full sending infrastructure configured — domain health, warmup, deliverability. You review and approve everything before launch.",
    tags: ["Email Sequences", "LinkedIn Outreach", "Infrastructure"],
  },
  {
    num: "03",
    timing: "Weeks 3–4",
    title: "Launch and Optimize",
    description:
      "Campaigns go live across email and LinkedIn. Every reply is handled by us — objections managed, questions answered, prospects pushed toward the meeting. Weekly report lands in your inbox: emails sent, open rate, reply rate, meetings booked.",
    tags: ["Campaign Live", "Reply Management", "Weekly Reports"],
  },
  {
    num: "04",
    timing: "Ongoing",
    title: "Qualified Meetings on Your Calendar",
    description:
      "When a prospect is ready we book directly onto your calendar. You receive a briefing note before every meeting — company name, decision-maker title, what they need, and context from the conversation. You show up. You close.",
    tags: ["Calendar Booking", "Meeting Briefs", "Briefing Notes"],
  },
];

export default function Process() {
  return (
    <section
      id="process"
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
            How It Works
          </div>
          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(42px, 6vw, 72px)",
              letterSpacing: "2px",
              color: "#1C2B2B",
              lineHeight: 0.95,
            }}
          >
            FROM ZERO TO BOOKED<br />
            <span style={{ color: "#E8A020" }}>IN 30 DAYS.</span>
          </h2>
        </div>

        {/* Steps */}
        <div
          style={{
            border: "1px solid #C8C1B3",
            background: "#C8C1B3",
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          {steps.map((step) => (
            <div
              key={step.num}
              style={{
                background: "#EEE9DF",
                padding: "36px 36px",
                display: "grid",
                gridTemplateColumns: "80px 1fr",
                gap: "0 32px",
                alignItems: "start",
              }}
            >
              {/* Step number */}
              <div>
                <div
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 56,
                    color: "#C8C1B3",
                    lineHeight: 1,
                    marginBottom: 4,
                  }}
                >
                  {step.num}
                </div>
                <div
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 9,
                    letterSpacing: "1.5px",
                    color: "#8C8070",
                    textTransform: "uppercase",
                  }}
                >
                  {step.timing}
                </div>
              </div>

              {/* Content */}
              <div>
                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "#1C2B2B",
                    marginBottom: 12,
                    lineHeight: 1.3,
                  }}
                >
                  {step.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: "#8C8070",
                    lineHeight: 1.7,
                    marginBottom: 16,
                    maxWidth: 640,
                  }}
                >
                  {step.description}
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {step.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        fontFamily: "'DM Mono', monospace",
                        fontSize: 9,
                        letterSpacing: "1.5px",
                        textTransform: "uppercase",
                        color: "#E8A020",
                        border: "1px solid rgba(232,160,32,0.25)",
                        padding: "3px 8px",
                        background: "rgba(232,160,32,0.06)",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ marginTop: 40, display: "flex", alignItems: "center", gap: 20 }}>
          <a
            href="#contact"
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 12,
              letterSpacing: "1.5px",
              padding: "14px 28px",
              background: "#E8A020",
              color: "#F7F4EE",
              textDecoration: "none",
              fontWeight: 500,
              transition: "background 0.2s",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#F0AA30")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#E8A020")}
          >
            START WITH A FREE AUDIT →
          </a>
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: "#8C8070",
            }}
          >
            No commitment. No pitch.
          </span>
        </div>
      </div>
    </section>
  );
}
