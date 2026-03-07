"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  once?: boolean;
}

export default function SplitText({
  text,
  className = "",
  delay = 0,
  once = true,
}: SplitTextProps) {
  const ref = useRef(null);
  const inView = useInView(ref, { once, margin: "-40px" });
  const words = text.split(" ");

  return (
    <span ref={ref} className={className} aria-label={text}>
      {words.map((word, i) => (
        <span
          key={i}
          className="clip-wrap"
          style={{ marginRight: i < words.length - 1 ? "0.28em" : 0 }}
        >
          <motion.span
            initial={{ y: "105%" }}
            animate={inView ? { y: 0 } : { y: "105%" }}
            transition={{
              duration: 0.75,
              delay: delay + i * 0.07,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }}
            style={{ display: "inline-block" }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
