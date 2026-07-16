"use client";

import { motion } from "framer-motion";
import { C, F } from "./theme";
import { wrap, H2, Lede, Reveal } from "./ui";

/* Optionality, not hierarchy. No channel wins; we cannot know in
   advance which one a given owner answers on, so we run all three. */

const CHANNELS: [string, string][] = [
  ["Email", "For the owner who wants to think before he talks."],
  ["LinkedIn", "For the owner who checks who has been looking at his profile."],
  ["The phone", "For the owner who opens neither."],
];

export default function Channels() {
  return (
    <section style={{ ...wrap, padding: "104px 40px" }}>
      <Reveal>
        <H2 max={860}>Owners do not all answer the same way.</H2>
        <Lede max={620}>
          One replies to an email at six in the morning. The next has not opened
          LinkedIn since 2019 but will talk for twenty minutes from his truck. We
          run all three, because there is no telling in advance which one he is.
        </Lede>
      </Reveal>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, marginTop: 44, background: C.border, border: `1px solid ${C.border}` }}>
        {CHANNELS.map(([name, body], i) => (
          <Reveal key={name} delay={i * 0.06}>
            <motion.div
              whileHover={{ backgroundColor: C.accentWash }}
              transition={{ duration: 0.2 }}
              style={{ background: C.panel, padding: 32, height: "100%" }}
            >
              <div style={{ fontFamily: C.mono, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: C.muted, marginBottom: 16 }}>
                0{i + 1}
              </div>
              <h3
                style={{
                  fontFamily: F.stack,
                  fontSize: 24,
                  fontWeight: F.weight,
                  letterSpacing: F.tracking,
                  color: C.ink,
                  margin: "0 0 10px",
                }}
              >
                {name}
              </h3>
              <p style={{ color: C.mid, fontSize: 15, lineHeight: 1.6, margin: 0 }}>{body}</p>
            </motion.div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
