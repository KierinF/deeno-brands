"use client";

import { C, F } from "./theme";
import { wrap, H2, Lede, Reveal } from "./ui";

/* The anchor. The point is not that we are cheaper, because we
   are not. The point is that we are the only column where the
   last row is zero. Everything above it is setup. */

type Col = {
  name: string;
  sub: string;
  rows: string[];
  zero: string;
  ours?: boolean;
};

const COLS: Col[] = [
  {
    name: "In-house SDR",
    sub: "You hire and carry it",
    rows: [
      "Around $95,000 a year, loaded",
      "Three months before they are useful",
      "Data and tooling on top",
      "And they may be gone inside a year",
    ],
    zero: "$95,000",
  },
  {
    name: "Retainer agency",
    sub: "You pay to find out",
    rows: [
      "Around $5,000 a month, every month",
      "Billed on activity, not outcomes",
      "The same invoice at twenty meetings or two",
      "You carry the risk",
    ],
    zero: "$60,000",
  },
  {
    name: "Deeno",
    sub: "We carry it",
    rows: [
      "Priced per qualified meeting",
      "No ramp",
      "Nothing to buy",
      "We carry the risk",
    ],
    zero: "$0",
    ours: true,
  },
];

export default function Compare() {
  return (
    <section style={{ ...wrap, padding: "104px 40px" }}>
      <Reveal>
        <H2 max={800}>Every other option bills you for the months nothing happens.</H2>
        <Lede>
          There are three ways to put qualified meetings on your calendar. Two of
          them charge you the same whether the meetings arrive or not.
        </Lede>
      </Reveal>

      <Reveal delay={0.05}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
            marginTop: 44,
            background: C.border,
            border: `1px solid ${C.border}`,
          }}
        >
          {COLS.map((c) => (
            <div
              key={c.name}
              style={{
                background: c.ours ? C.accentWash : C.panel,
                padding: 32,
                display: "flex",
                flexDirection: "column",
                borderTop: c.ours ? `2px solid ${C.accent}` : "2px solid transparent",
              }}
            >
              <h3
                style={{
                  fontFamily: F.stack,
                  fontSize: 22,
                  fontWeight: F.weight,
                  letterSpacing: F.tracking,
                  color: c.ours ? C.accent : C.ink,
                  margin: "0 0 4px",
                }}
              >
                {c.name}
              </h3>
              <div
                style={{
                  fontFamily: C.mono,
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: C.muted,
                  marginBottom: 26,
                }}
              >
                {c.sub}
              </div>

              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 32px" }}>
                {c.rows.map((r) => (
                  <li
                    key={r}
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "flex-start",
                      color: C.mid,
                      fontSize: 15,
                      lineHeight: 1.5,
                      marginBottom: 12,
                    }}
                  >
                    <span style={{ color: c.ours ? C.accent : C.muted, fontFamily: C.mono, fontSize: 12, marginTop: 2 }}>
                      {c.ours ? "+" : "−"}
                    </span>
                    {r}
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: "auto", borderTop: `1px solid ${c.ours ? C.accentLine : C.border}`, paddingTop: 22 }}>
                <div
                  style={{
                    fontFamily: C.mono,
                    fontSize: 10,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: C.muted,
                    marginBottom: 8,
                  }}
                >
                  A year with no meetings costs
                </div>
                <div
                  style={{
                    fontFamily: F.stack,
                    fontWeight: F.weight,
                    letterSpacing: F.tracking,
                    fontSize: c.ours ? 52 : 40,
                    lineHeight: 1,
                    color: c.ours ? C.accent : C.ink,
                  }}
                >
                  {c.zero}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
