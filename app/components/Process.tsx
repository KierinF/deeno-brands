"use client";

interface Step {
  num: string;
  timing: string;
  title: string;
  paragraphs: string[];
  standout?: string;
  standouts?: string[];
  tags: string[];
}

const steps: Step[] = [
  {
    num: "01",
    timing: "Week 1",
    title: "Getting clear on the accounts you want",
    paragraphs: [
      "Before we write a word of copy or pull a single contact, we spend 90 minutes getting clear on the exact accounts you want — buyer type, geography, contract size.",
      "Then we build a verified contact list from Apollo, Clay, and LinkedIn Sales Navigator.",
    ],
    standout: "You approve every name before we contact anyone.",
    tags: ["ICP mapping", "Contact list", "Market research"],
  },
  {
    num: "02",
    timing: "Week 2",
    title: "Campaign build",
    paragraphs: [
      "We build your full outreach stack from scratch — cold email sequences, LinkedIn messaging, phone scripts, and direct mail pieces — all written for your trade and your buyers.",
      "You review and approve everything before it goes live.",
    ],
    standouts: ["Nothing generic.", "Nothing templated from another industry."],
    tags: ["Email campaigns", "Cold calling", "LinkedIn", "Direct mail"],
  },
  {
    num: "03",
    timing: "Weeks 3\u20134",
    title: "Launch",
    paragraphs: [
      "All four channels go live simultaneously.",
      "Calls are made. Emails land. LinkedIn messages hit. Direct mail hits desks.",
      "Every reply is handled by us — objections managed, questions answered, prospects moved toward a meeting.",
    ],
    standout: "You get a weekly report in plain English: what went out, what came back, what's in motion.",
    tags: ["Campaign live", "Reply management", "Weekly reports"],
  },
  {
    num: "04",
    timing: "Ongoing",
    title: "Qualified meetings on your calendar",
    paragraphs: [
      "Before every meeting, we send you a briefing note.",
      "Company name, decision-maker title, what they need, and full context from the conversation.",
    ],
    standouts: [
      "You walk in knowing exactly who you're talking to and why they said yes.",
      "Your only job is to show up and close.",
    ],
    tags: ["Calendar booking", "Meeting briefs", "Briefing notes"],
  },
];

export default function Process() {
  return (
    <section
      id="process"
      className="rsp-section-pad"
      style={{ background: "#F7F4EE", borderBottom: "1px solid #C8C1B3", padding: "80px 40px" }}
    >
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
            The process
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
                padding: "40px 36px",
                display: "grid",
                gridTemplateColumns: "80px 1fr",
                gap: "0 32px",
                alignItems: "start",
              }}
            >
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
              <div>
                <h3 style={{ fontSize: 18, fontWeight: 600, color: "#1C2B2B", marginBottom: 16, lineHeight: 1.3 }}>
                  {step.title}
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                  {step.paragraphs.map((p, i) => (
                    <p key={i} style={{ fontSize: 14, color: "#8C8070", lineHeight: 1.7, maxWidth: 640 }}>{p}</p>
                  ))}
                </div>
                {step.standout && (
                  <p
                    style={{
                      fontSize: 14,
                      color: "#1C2B2B",
                      fontWeight: 500,
                      lineHeight: 1.6,
                      marginBottom: 16,
                      maxWidth: 640,
                      paddingLeft: 12,
                      borderLeft: "2px solid #E8A020",
                    }}
                  >
                    {step.standout}
                  </p>
                )}
                {step.standouts && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                    {step.standouts.map((s, i) => (
                      <p
                        key={i}
                        style={{
                          fontSize: 14,
                          color: "#1C2B2B",
                          fontWeight: 500,
                          lineHeight: 1.6,
                          paddingLeft: 12,
                          borderLeft: "2px solid #E8A020",
                          maxWidth: 640,
                        }}
                      >
                        {s}
                      </p>
                    ))}
                  </div>
                )}
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
              transition: "background 0.2s",
            }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#F0AA30")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "#E8A020")}
          >
            START WITH A FREE AUDIT →
          </a>
          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#8C8070" }}>
            No commitment. No pitch.
          </span>
        </div>
      </div>
    </section>
  );
}
