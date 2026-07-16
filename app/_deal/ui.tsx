"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { C, F } from "./theme";

export const wrap: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "0 40px",
};

/* Scroll reveal. Deliberately short and quick, no bounce. This
   buyer reads showy motion as an agency trying to be impressive. */
export function Reveal({
  children,
  delay = 0,
  y = 14,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function H2({ children, max }: { children: React.ReactNode; max?: number }) {
  return (
    <h2
      style={{
        fontFamily: F.stack,
        fontSize: "clamp(27px, 3vw, 42px)",
        fontWeight: F.weight,
        letterSpacing: F.tracking,
        lineHeight: 1.08,
        color: C.ink,
        margin: "0 0 18px",
        maxWidth: max,
      }}
    >
      {children}
    </h2>
  );
}

export function Lede({
  children,
  max = 620,
  center,
}: {
  children: React.ReactNode;
  max?: number;
  center?: boolean;
}) {
  return (
    <p
      style={{
        fontSize: 18,
        lineHeight: 1.6,
        color: C.mid,
        maxWidth: max,
        margin: center ? "0 auto" : 0,
      }}
    >
      {children}
    </p>
  );
}

export function CTA({ small }: { small?: boolean }) {
  return (
    <motion.a
      href="#check"
      whileHover={{ y: -2 }}
      whileTap={{ y: 0 }}
      transition={{ duration: 0.15 }}
      style={{
        display: "inline-block",
        padding: small ? "11px 20px" : "17px 32px",
        background: C.accent,
        color: C.accentInk,
        textDecoration: "none",
        fontFamily: C.mono,
        fontSize: small ? 11 : 12,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      Check if your vertical is open →
    </motion.a>
  );
}
