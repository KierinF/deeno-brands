"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

const TRADES = ["HVAC", "Plumbing", "Roofing", "Electrical", "Landscaping", "Painting", "Pest Control"] as const;
type Trade = (typeof TRADES)[number];

type LineStatus = "ok" | "warn" | "fail" | "info" | "divider" | "result";

interface ScanLine {
  text: string;
  status: LineStatus;
  delay: number;
}

function buildScanLines(trade: Trade): ScanLine[] {
  const tradeData: Record<Trade, { rivals: number; score: string; speed: string; risk: number; months: number }> = {
    HVAC:         { rivals: 3, score: "3.8", speed: "4.2s", risk: 78, months: 18 },
    Plumbing:     { rivals: 4, score: "3.5", speed: "5.1s", risk: 84, months: 14 },
    Roofing:      { rivals: 2, score: "4.1", speed: "3.8s", risk: 71, months: 22 },
    Electrical:   { rivals: 5, score: "3.2", speed: "5.9s", risk: 91, months: 10 },
    Landscaping:  { rivals: 3, score: "3.9", speed: "4.7s", risk: 75, months: 20 },
    Painting:     { rivals: 2, score: "4.0", speed: "4.0s", risk: 68, months: 24 },
    "Pest Control": { rivals: 4, score: "3.6", speed: "4.5s", risk: 80, months: 16 },
  };
  const d = tradeData[trade];
  const bar = "█".repeat(Math.round(d.risk / 6.25)) + "░".repeat(16 - Math.round(d.risk / 6.25));
  return [
    { text: `$ deeno-scan --trade=${trade} --region=local --year=2025`, status: "info", delay: 0 },
    { text: "", status: "info", delay: 300 },
    { text: "> Initializing extinction risk protocol...", status: "info", delay: 700 },
    { text: "> Scanning digital footprint...", status: "info", delay: 1200 },
    { text: `> Google organic rankings (top 10)...       ✗ NOT FOUND`, status: "fail", delay: 1800 },
    { text: `> LSA ad coverage...                        ✗ NONE DETECTED`, status: "fail", delay: 2400 },
    { text: `> Review score (threshold: 4.0★)...         ⚠ ${d.score} — BELOW THRESHOLD`, status: "warn", delay: 3000 },
    { text: `> Active competitor LSA campaigns...        ! ${d.rivals} RIVALS SPENDING NOW`, status: "warn", delay: 3600 },
    { text: `> Mobile page speed...                      ⚠ SLOW (est. ${d.speed} load)`, status: "warn", delay: 4200 },
    { text: `> Call tracking & attribution...            ✗ NOT INSTALLED`, status: "fail", delay: 4800 },
    { text: `> Lead follow-up automation...              ✗ NONE DETECTED`, status: "fail", delay: 5300 },
    { text: "", status: "info", delay: 5700 },
    { text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", status: "divider", delay: 5900 },
    { text: "ASSESSMENT COMPLETE", status: "result", delay: 6200 },
    { text: "", status: "info", delay: 6300 },
    { text: `EXTINCTION RISK: HIGH`, status: "result", delay: 6500 },
    { text: `${bar}  ${d.risk}%`, status: "result", delay: 6700 },
    { text: "", status: "info", delay: 6900 },
    { text: `PROGNOSIS: Without digital adaptation, estimated`, status: "info", delay: 7000 },
    { text: `${d.months} months before competitor market capture.`, status: "info", delay: 7200 },
    { text: "", status: "info", delay: 7400 },
    { text: "RECOMMENDED ACTION: Contact Deeno Brands.", status: "result", delay: 7600 },
    { text: "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━", status: "divider", delay: 7800 },
  ];
}

function lineColor(status: LineStatus) {
  if (status === "fail")    return "text-[#D4522A]";
  if (status === "warn")    return "text-[#C9A84C]";
  if (status === "divider") return "text-[#C9A84C]/30";
  if (status === "result")  return "text-[#C9A84C] font-bold";
  return "text-[#F2E8D5]/70";
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ExtinctionTerminal({ open, onClose }: Props) {
  const [trade, setTrade] = useState<Trade>("HVAC");
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [visibleLines, setVisibleLines] = useState<ScanLine[]>([]);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Reset when closed
  useEffect(() => {
    if (!open) {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
      setPhase("idle");
      setVisibleLines([]);
    }
  }, [open]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleLines]);

  function runAssessment() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setVisibleLines([]);
    setPhase("running");
    const lines = buildScanLines(trade);
    lines.forEach((line, i) => {
      const t = setTimeout(() => {
        setVisibleLines(prev => [...prev, line]);
        if (i === lines.length - 1) setPhase("done");
      }, line.delay);
      timersRef.current.push(t);
    });
  }

  function handleBookCall() {
    onClose();
    setTimeout(() => {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    }, 400);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8"
          style={{ background: "rgba(14,11,7,0.97)" }}
        >
          {/* Scan line effect */}
          <div className="scan-line" />

          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {/* Terminal window frame */}
            <div
              className="rounded-lg overflow-hidden"
              style={{
                background: "#0E0B07",
                border: "1px solid rgba(201,168,76,0.3)",
                boxShadow: "0 0 80px rgba(201,168,76,0.08), 0 0 0 1px rgba(201,168,76,0.1)",
              }}
            >
              {/* Title bar */}
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: "1px solid rgba(201,168,76,0.15)", background: "#181410" }}
              >
                <div className="flex items-center gap-2">
                  <span style={{ color: "#C9A84C", fontSize: 11, letterSpacing: "0.15em" }}>
                    DEENO EXTINCTION SCANNER v2.5.1
                  </span>
                </div>
                <button
                  onClick={onClose}
                  style={{ color: "rgba(242,232,213,0.4)" }}
                  className="hover:text-[#F2E8D5] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Terminal body */}
              <div className="p-6 min-h-[420px] flex flex-col" style={{ fontSize: 13, lineHeight: "1.7" }}>

                {/* Idle state: trade selector */}
                {phase === "idle" && (
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="text-[#C9A84C]/70 text-xs mb-6" style={{ letterSpacing: "0.1em" }}>
                      SELECT YOUR TRADE TO BEGIN ASSESSMENT
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-8">
                      {TRADES.map(t => (
                        <button
                          key={t}
                          onClick={() => setTrade(t)}
                          className="text-left px-3 py-2 text-sm transition-all"
                          style={{
                            background: trade === t ? "rgba(201,168,76,0.15)" : "rgba(242,232,213,0.03)",
                            border: `1px solid ${trade === t ? "rgba(201,168,76,0.5)" : "rgba(242,232,213,0.08)"}`,
                            color: trade === t ? "#C9A84C" : "rgba(242,232,213,0.5)",
                            borderRadius: 4,
                          }}
                        >
                          {trade === t ? "> " : "  "}{t}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={runAssessment}
                      className="w-full py-3 text-sm font-semibold tracking-widest transition-all"
                      style={{
                        background: "#8B5CF6",
                        color: "#fff",
                        borderRadius: 4,
                        letterSpacing: "0.12em",
                      }}
                    >
                      RUN EXTINCTION ASSESSMENT →
                    </button>
                    <p className="text-[#F2E8D5]/20 text-xs mt-3 text-center">
                      ESC to close
                    </p>
                  </div>
                )}

                {/* Running / Done: terminal output */}
                {(phase === "running" || phase === "done") && (
                  <div className="flex-1 flex flex-col">
                    <div
                      ref={scrollRef}
                      className="flex-1 overflow-y-auto mb-4"
                      style={{ maxHeight: 340, scrollbarWidth: "none" }}
                    >
                      {visibleLines.map((line, i) => (
                        <div
                          key={i}
                          className={`${lineColor(line.status)} whitespace-pre`}
                          style={{ fontSize: 12.5, lineHeight: "1.6" }}
                        >
                          {line.text || "\u00A0"}
                        </div>
                      ))}
                      {phase === "running" && (
                        <span className="terminal-cursor" />
                      )}
                    </div>

                    {phase === "done" && (
                      <div
                        className="flex gap-3 pt-4"
                        style={{ borderTop: "1px solid rgba(201,168,76,0.15)" }}
                      >
                        <button
                          onClick={handleBookCall}
                          className="flex-1 py-2.5 text-sm font-semibold tracking-wider transition-all"
                          style={{
                            background: "#8B5CF6",
                            color: "#fff",
                            borderRadius: 4,
                            letterSpacing: "0.08em",
                          }}
                        >
                          BOOK FREE SURVIVAL CALL
                        </button>
                        <button
                          onClick={onClose}
                          className="px-5 py-2.5 text-sm tracking-wider transition-all"
                          style={{
                            border: "1px solid rgba(242,232,213,0.12)",
                            color: "rgba(242,232,213,0.4)",
                            borderRadius: 4,
                          }}
                        >
                          CLOSE
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
