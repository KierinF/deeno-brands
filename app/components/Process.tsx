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
    title: "We define success before we build anything",
    paragraphs: [
      "Before we write a word of copy or pull a single contact we spend 90 minutes getting completely clear on your market, your ideal accounts, and what a qualified meeting actually means for your business.",
      "Then we build your verified contact list and set up your CRM. Every account, every deal, every conversation in one place from day one.",
    ],
    standout: "You approve everything before we contact anyone.",
    tags: ["ICP mapping", "Contact list", "CRM setup", "Guarantee established"],
  },
  {
    num: "02",
    timing: "Week 2",
    title: "We build the engine",
    paragraphs: [
      "Every campaign built from scratch for your trade and your market. Cold email sequences. Phone scripts. LinkedIn messaging. Direct mail. All written in the language your buyers actually respond to.",
      "Nothing recycled. Nothing from another industry. You review and approve before anything goes live.",
    ],
    tags: ["Email campaigns", "Cold calling", "LinkedIn", "Direct mail", "Pipeline infrastructure"],
  },
  {
    num: "03",
    timing: "Weeks 3\u20134",
    title: "We run it",
    paragraphs: [
      "Every channel goes live at the same time. Every reply comes back to us. Objections handled. Questions answered. Prospects moved toward a meeting. Every active deal tracked and followed up until it closes or dies.",
      "You get a weekly report in plain English. What went out. What came back. What\u2019s moving. What\u2019s stalled and why.",
    ],
    tags: ["Campaign management", "Reply handling", "Pipeline management", "Weekly reporting"],
  },
  {
    num: "04",
    timing: "Months 2\u20133",
    title: "We prove it",
    paragraphs: [
      "The system is running. Now we make it better.",
      "Every week we look at what\u2019s working and what isn\u2019t. Which channels are producing. Which sequences are converting. Which account types are at risk. We cut what isn\u2019t working and double down on what is.",
      "As the outbound engine proves itself we begin building the layers around it. Nurture. Retention. The foundation of a revenue intelligence picture that shows you exactly where your growth is coming from.",
      "Everything gets documented into a playbook that lives in your business not ours.",
    ],
    standouts: [
      "By the end of month three you have a proven engine, an organized pipeline, and the beginning of something that compounds.",
      "At that point you decide. Keep us building on it. Or bring it in house. Either way the foundation is yours.",
    ],
    tags: ["Testing and optimization", "Retention", "Revenue intelligence", "Playbook", "Handoff"],
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
            HOW WE BUILD YOUR<br />
            <span style={{ color: "#E8A020" }}>GROWTH ENGINE.</span>
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
