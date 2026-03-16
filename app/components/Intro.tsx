"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Intro() {
  const [done, setDone] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("db-intro-seen")) {
      setDone(true);
      return;
    }
    const t1 = setTimeout(() => setShow(true), 200);
    const t2 = setTimeout(() => {
      sessionStorage.setItem("db-intro-seen", "1");
      setDone(true);
    }, 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="intro"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
          className="fixed inset-0 z-[300] flex items-center justify-center"
          style={{ background: "#EDEAE0" }}
        >
          <AnimatePresence>
            {show && (
              <motion.div
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center gap-4"
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    background: "#1C1917",
                    borderRadius: 12,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="#EDEAE0" aria-hidden="true">
                    <path d="M 0 0 C -1.2 -1.5 -1.2 -7.5 0 -11 C 1.2 -7.5 1.2 -1.5 0 0 Z" transform="translate(12,16)" />
                    <path d="M 0 0 C -1.2 -1.5 -1.2 -7.5 0 -11 C 1.2 -7.5 1.2 -1.5 0 0 Z" transform="translate(12,16) rotate(-36)" />
                    <path d="M 0 0 C -1.2 -1.5 -1.2 -7.5 0 -11 C 1.2 -7.5 1.2 -1.5 0 0 Z" transform="translate(12,16) rotate(36)" />
                    <ellipse cx="12" cy="21" rx="2.2" ry="1.6" />
                  </svg>
                </div>
                <div style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 14, color: "#1C1917", letterSpacing: "0.04em" }}>
                  Deeno.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
