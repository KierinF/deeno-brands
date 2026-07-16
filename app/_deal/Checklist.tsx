"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { C, F } from "./theme";
import { wrap, H2, Lede, Reveal } from "./ui";

/* The guarantee, made operable.
   Static, this is a list of claims. Interactive, the visitor
   proves it to themselves: switch any criterion off and watch the
   invoice go to zero. The offer demonstrated rather than asserted. */

const CRITERIA = [
  "Owner or majority shareholder. Not a manager, not a CFO.",
  "Revenue and EBITDA inside your stated band.",
  "In your target industry and geography.",
  "Not currently represented, not under LOI, not in a process.",
  "Open to discussing a transaction in the next 12 months.",
  "Showed up to the call.",
];

export default function Checklist() {
  const [on, setOn] = useState<boolean[]>(() => CRITERIA.map(() => true));
  const allTrue = on.every(Boolean);
  const failed = on.filter((x) => !x).length;

  return (
    <section id="contract" style={{ ...wrap, padding: "104px 40px", scrollMarginTop: 68 }}>
      <Reveal>
        <H2>You&apos;re only charged if all six are true.</H2>
        <Lede>
          Everyone in this business says qualified. Almost nobody will write down
          what they mean by it. Switch one off and see what happens to your
          invoice.
        </Lede>
      </Reveal>

      <Reveal delay={0.05}>
        <div style={{ marginTop: 44, border: `1px solid ${C.border}`, background: C.panel }}>
          {CRITERIA.map((c, i) => {
            const active = on[i];
            return (
              <button
                key={i}
                onClick={() => setOn((p) => p.map((v, j) => (j === i ? !v : v)))}
                style={{
                  width: "100%",
                  display: "grid",
                  gridTemplateColumns: "64px 1fr 92px",
                  alignItems: "center",
                  gap: 12,
                  padding: "22px 26px",
                  borderTop: i === 0 ? "none" : `1px solid ${C.border}`,
                  background: active ? "transparent" : C.redWash,
                  border: "none",
                  borderLeft: `2px solid ${active ? "transparent" : C.red}`,
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                  transition: "background 0.25s ease, border-color 0.25s ease",
                }}
              >
                <motion.span
                  animate={{
                    backgroundColor: active ? C.accent : "rgba(0,0,0,0)",
                    borderColor: active ? C.accent : C.borderStrong,
                  }}
                  transition={{ duration: 0.2 }}
                  style={{
                    width: 26,
                    height: 26,
                    border: `1.5px solid ${C.borderStrong}`,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: C.accentInk,
                    fontSize: 14,
                  }}
                >
                  <AnimatePresence>
                    {active && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        ✓
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.span>

                <span
                  style={{
                    fontSize: 17,
                    lineHeight: 1.5,
                    color: active ? C.ink : C.muted,
                    textDecoration: active ? "none" : "line-through",
                    textDecorationColor: C.red,
                    transition: "color 0.25s ease",
                  }}
                >
                  {c}
                </span>

                <span
                  style={{
                    fontFamily: C.mono,
                    fontSize: 10,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: active ? C.muted : C.red,
                    textAlign: "right",
                  }}
                >
                  {active ? `0${i + 1}` : "Fails"}
                </span>
              </button>
            );
          })}
        </div>

        <motion.div
          animate={{
            backgroundColor: allTrue ? C.accentWash : C.redWash,
            borderColor: allTrue ? C.accent : C.red,
          }}
          transition={{ duration: 0.3 }}
          style={{
            border: `2px solid ${C.accent}`,
            borderTop: "none",
            padding: "26px 30px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div>
            <AnimatePresence mode="wait">
              <motion.div
                key={allTrue ? "yes" : "no"}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  style={{
                    fontFamily: F.stack,
                    fontWeight: F.weight,
                    letterSpacing: F.tracking,
                    fontSize: 24,
                    color: allTrue ? C.accent : C.red,
                    marginBottom: 4,
                  }}
                >
                  {allTrue ? "This meeting counts." : "This meeting does not count."}
                </div>
                <div style={{ color: C.mid, fontSize: 15 }}>
                  {allTrue
                    ? "All six clear. We invoice."
                    : `${failed === 1 ? "One criterion" : `${failed} criteria`} failed. Flag it within 48 hours and we void the invoice and replace the meeting.`}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: C.mono,
                fontSize: 10,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: C.muted,
                marginBottom: 2,
              }}
            >
              You are invoiced
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={allTrue ? "rate" : "zero"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                style={{
                  fontFamily: F.stack,
                  fontWeight: F.weight,
                  letterSpacing: F.tracking,
                  fontSize: allTrue ? 30 : 44,
                  lineHeight: 1,
                  color: allTrue ? C.accent : C.red,
                }}
              >
                {allTrue ? "Your agreed rate" : "$0"}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </Reveal>
    </section>
  );
}
