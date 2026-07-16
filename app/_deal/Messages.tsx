"use client";

import { C, F } from "./theme";
import { wrap, H2, Lede, Reveal } from "./ui";

/* Show, do not claim.
   Saying "we write custom messages" is exactly what a firm using
   templates would say. The only version of this section that works
   is the one that puts both messages on the page and lets the
   reader see the difference in four seconds.

   The left-hand message is a composed archetype of bad outbound,
   not a real firm's copy. */

type Mail = {
  tag: string;
  bad?: boolean;
  from: string;
  subject: string;
  body: string[];
  notes: string[];
};

const TYPICAL: Mail = {
  tag: "Typical agency message",
  bad: true,
  from: "Generic SDR",
  subject: "Quick question",
  body: [
    "Hi {first_name},",
    "I hope this email finds you well! My name is {sender_name} and I'm reaching out from {company_name}, a leading M&A advisory firm helping business owners maximize their exit value.",
    "We work with companies in the {industry} space and I wanted to see if you'd be open to a quick 15-minute call to discuss how we can help you unlock the value in your business.",
    "Are you free {day_1} at {time_1} or {day_2} at {time_2}?",
    "Best regards,\n{sender_name}\nBusiness Development Representative",
  ],
  notes: [
    "Merge fields where the thinking should be",
    "Three sentences about themselves",
    "Language no owner has ever used",
    "Asks for a slot before giving a reason",
  ],
};

const DEENO: Mail = {
  tag: "A message we would send",
  from: "Kierin",
  subject: "question after 25 years with Acme",
  body: [
    "Hi Sarah,",
    "Given you've been with Acme for about 25 years now, I imagine you're starting to consider retirement and what will happen to Acme and the team you've built.",
    "We just helped another HVAC company right down the road in Port Jefferson sell for 6x EBITDA and the buyers kept everyone on. Happy to share the playbook we used to do it.",
    "Interested?",
    "Cheers,\nKierin",
  ],
  notes: [
    "One detail only someone who looked would know",
    "Names the fear, not the transaction",
    "Proof from her own street, not a case study",
    "Offers the playbook, not a calendar slot",
  ],
};

/* Render {merge_fields} as visible tokens. The braces are the
   whole argument on the left-hand side, so they should look like
   what they are rather than sit quietly in the prose. */
function withTokens(text: string, edge: string) {
  return text.split(/(\{[^}]+\})/g).map((part, i) =>
    part.startsWith("{") && part.endsWith("}") ? (
      <span
        key={i}
        style={{
          fontFamily: C.mono,
          fontSize: 13,
          color: edge,
          background: C.redWash,
          border: `1px solid rgba(140,47,30,0.25)`,
          borderRadius: 2,
          padding: "1px 4px",
          whiteSpace: "nowrap",
        }}
      >
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function Envelope({ m }: { m: Mail }) {
  const edge = m.bad ? C.red : C.accent;
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.border}`, borderTop: `2px solid ${edge}`, display: "flex", flexDirection: "column", height: "100%" }}>
      {/* tag */}
      <div
        style={{
          fontFamily: C.mono,
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: edge,
          padding: "16px 26px 0",
        }}
      >
        {m.tag}
      </div>

      {/* headers */}
      <div style={{ padding: "16px 26px", borderBottom: `1px solid ${C.border}` }}>
        {[
          ["From", m.from],
          ["Subject", m.subject],
        ].map(([k, v]) => (
          <div key={k} style={{ display: "flex", gap: 10, marginBottom: 4 }}>
            <span style={{ fontFamily: C.mono, fontSize: 11, color: C.muted, width: 52 }}>{k}</span>
            <span style={{ fontFamily: C.mono, fontSize: 11, color: C.mid }}>{v}</span>
          </div>
        ))}
      </div>

      {/* body */}
      <div style={{ padding: "26px", flex: 1 }}>
        {m.body.map((p, i) => (
          <p
            key={i}
            style={{
              margin: "0 0 16px",
              fontSize: 15,
              lineHeight: 1.65,
              color: m.bad ? C.muted : C.ink,
              whiteSpace: "pre-line",
            }}
          >
            {m.bad ? withTokens(p, edge) : p}
          </p>
        ))}
      </div>

      {/* annotations */}
      <div style={{ borderTop: `1px solid ${C.border}`, padding: "20px 26px", background: m.bad ? C.redWash : C.accentWash }}>
        {m.notes.map((n) => (
          <div key={n} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 8 }}>
            <span style={{ color: edge, fontFamily: C.mono, fontSize: 12, lineHeight: 1.5 }}>
              {m.bad ? "✕" : "✓"}
            </span>
            <span style={{ color: C.mid, fontSize: 13.5, lineHeight: 1.5 }}>{n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Messages() {
  return (
    <section style={{ background: C.bgAlt, borderBlock: `1px solid ${C.border}`, padding: "104px 0" }}>
      <div style={wrap}>
        <Reveal>
          <H2 max={820}>
            We do not use templates. Every message is written for one owner.
          </H2>
          <Lede max={640}>
            Sarah has had four of these this month. The only thing that gets an
            answer is the one that proves somebody actually looked at her
            business before they wrote.
          </Lede>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 20, marginTop: 44, alignItems: "stretch" }}>
          <Reveal>
            <Envelope m={TYPICAL} />
          </Reveal>
          <Reveal delay={0.08}>
            <Envelope m={DEENO} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
