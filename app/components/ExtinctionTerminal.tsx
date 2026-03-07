"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

type Phase = "idle" | "scanning" | "done";

// Lines typed before the real response arrives (while API call runs)
const CONNECTING_LINES = [
  "> Initializing scanner...",
  "> Resolving domain...",
  "> Fetching page HTML...",
  "> Parsing structure...",
  "> Checking SEO signals...",
  "> Analyzing marketing health...",
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function ExtinctionTerminal({ open, onClose }: Props) {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [lines, setLines] = useState<string[]>([]);
  const [connIdx, setConnIdx] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const connTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset on close
  useEffect(() => {
    if (!open) {
      abortRef.current?.abort();
      if (connTimerRef.current) clearTimeout(connTimerRef.current);
      setPhase("idle");
      setLines([]);
      setConnIdx(0);
      // Don't clear URL so it persists if user reopens
    }
  }, [open]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // Type out connecting lines while waiting
  useEffect(() => {
    if (phase !== "scanning") return;
    if (connIdx >= CONNECTING_LINES.length) return;

    connTimerRef.current = setTimeout(() => {
      setLines(prev => [...prev, CONNECTING_LINES[connIdx]]);
      setConnIdx(i => i + 1);
    }, connIdx === 0 ? 0 : 400 + Math.random() * 200);

    return () => { if (connTimerRef.current) clearTimeout(connTimerRef.current); };
  }, [phase, connIdx]);

  function handleClose() {
    abortRef.current?.abort();
    onClose();
  }

  async function runScan() {
    const trimmed = url.trim();
    if (!trimmed) return;

    abortRef.current = new AbortController();
    setPhase("scanning");
    setLines([]);
    setConnIdx(0);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
        signal: abortRef.current.signal,
      });

      if (!res.ok || !res.body) {
        setLines(prev => [...prev, "", `> Error: ${res.status} — ${res.statusText}`]);
        setPhase("done");
        return;
      }

      // Clear the connecting lines and stream real response
      setLines([]);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Split by newlines and add complete lines
        const parts = buffer.split("\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          setLines(prev => [...prev, part]);
        }
      }
      // Flush remaining
      if (buffer) setLines(prev => [...prev, buffer]);
      setPhase("done");

    } catch (err: unknown) {
      if ((err as { name?: string }).name === "AbortError") return;
      setLines(prev => [...prev, "", "> Scan aborted — could not reach the URL."]);
      setPhase("done");
    }
  }

  function handleBookCall() {
    handleClose();
    setTimeout(() => {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    }, 400);
  }

  function lineStyle(line: string) {
    if (line.includes("✗") || line.includes("NONE") || line.includes("MISSING") || line.includes("NOT FOUND") || line.includes("WEAK")) {
      return { color: "#D4522A" };
    }
    if (line.includes("⚠") || line.includes("GENERIC") || line.includes("BLOCKED") || line.includes("SLOW") || line.includes("BELOW") || line.includes("TIMEOUT")) {
      return { color: "#C9A84C" };
    }
    if (line.includes("━") || line.includes("SCAN COMPLETE") || line.includes("GRADE") || line.includes("TOP 3")) {
      return { color: "#C9A84C", fontWeight: "bold" };
    }
    if (line.startsWith(">") || line.startsWith("1.") || line.startsWith("2.") || line.startsWith("3.")) {
      return { color: "#E8E4D8" };
    }
    return { color: "rgba(232,228,216,0.55)" };
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8"
          style={{ background: "rgba(28,25,23,0.88)", backdropFilter: "blur(8px)" }}
          onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <motion.div
            initial={{ scale: 0.96, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 20 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl"
          >
            {/* Terminal window */}
            <div
              style={{
                background: "#0E0B07",
                border: "1px solid rgba(201,168,76,0.25)",
                borderRadius: 8,
                boxShadow: "0 0 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.08)",
                fontFamily: '"SF Mono","Fira Code","Fira Mono",monospace',
              }}
            >
              {/* Title bar */}
              <div
                style={{
                  background: "#181410",
                  borderBottom: "1px solid rgba(201,168,76,0.15)",
                  padding: "10px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, letterSpacing: "0.15em", color: "#C9A84C" }}>
                    DEENO EXTINCTION SCANNER v2.5.1
                  </span>
                  {phase === "scanning" && (
                    <span
                      style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: "#C9A84C",
                        display: "inline-block",
                        animation: "blink 0.8s step-end infinite",
                      }}
                    />
                  )}
                </div>
                <button
                  onClick={handleClose}
                  style={{ color: "rgba(232,228,216,0.35)", display: "flex" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#E8E4D8")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(232,228,216,0.35)")}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: "20px 20px 16px", minHeight: 400, display: "flex", flexDirection: "column" }}>

                {/* Idle — URL input */}
                {phase === "idle" && (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <p style={{ fontSize: 10, letterSpacing: "0.1em", color: "rgba(201,168,76,0.5)", marginBottom: 24, textTransform: "uppercase" }}>
                      Drop your website. We&apos;ll tell you what&apos;s broken.
                    </p>

                    <div style={{ marginBottom: 16, position: "relative" }}>
                      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#C9A84C", fontSize: 12 }}>$</span>
                      <input
                        type="url"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") runScan(); }}
                        placeholder="yourbusiness.com"
                        autoFocus
                        style={{
                          width: "100%",
                          background: "#181410",
                          border: "1px solid rgba(201,168,76,0.25)",
                          borderRadius: 4,
                          padding: "12px 12px 12px 26px",
                          color: "#E8E4D8",
                          fontSize: 13,
                          fontFamily: "inherit",
                          outline: "none",
                        }}
                        onFocus={e => (e.target.style.borderColor = "rgba(201,168,76,0.6)")}
                        onBlur={e => (e.target.style.borderColor = "rgba(201,168,76,0.25)")}
                      />
                    </div>

                    <button
                      onClick={runScan}
                      disabled={!url.trim()}
                      style={{
                        width: "100%",
                        padding: "12px",
                        background: "#8B5CF6",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        fontSize: 12,
                        fontFamily: "inherit",
                        letterSpacing: "0.12em",
                        cursor: url.trim() ? "pointer" : "not-allowed",
                        opacity: url.trim() ? 1 : 0.4,
                        marginBottom: 16,
                        textTransform: "uppercase",
                      }}
                      onMouseEnter={e => { if (url.trim()) (e.currentTarget.style.background = "#7C3AED"); }}
                      onMouseLeave={e => (e.currentTarget.style.background = "#8B5CF6")}
                    >
                      SCAN IT →
                    </button>

                    <p style={{ fontSize: 9, color: "rgba(201,168,76,0.3)", textAlign: "center", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      We don&apos;t save the results. Promise. · ESC to close
                    </p>
                  </div>
                )}

                {/* Scanning / Done — terminal output */}
                {(phase === "scanning" || phase === "done") && (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <p style={{ fontSize: 9, color: "rgba(201,168,76,0.4)", marginBottom: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      SCANNING: {url}
                    </p>

                    <div
                      ref={scrollRef}
                      style={{
                        flex: 1,
                        overflowY: "auto",
                        maxHeight: 320,
                        scrollbarWidth: "none",
                        marginBottom: 12,
                      }}
                    >
                      {lines.map((line, i) => (
                        <div
                          key={i}
                          style={{
                            fontSize: 12,
                            lineHeight: 1.7,
                            whiteSpace: "pre",
                            ...lineStyle(line),
                          }}
                        >
                          {line || "\u00A0"}
                        </div>
                      ))}
                      {phase === "scanning" && <span className="terminal-cursor" />}
                    </div>

                    {phase === "done" && (
                      <div style={{ display: "flex", gap: 8, borderTop: "1px solid rgba(201,168,76,0.12)", paddingTop: 12 }}>
                        <button
                          onClick={handleBookCall}
                          style={{
                            flex: 1,
                            padding: "10px",
                            background: "#8B5CF6",
                            color: "#fff",
                            border: "none",
                            borderRadius: 4,
                            fontSize: 10,
                            fontFamily: "inherit",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = "#7C3AED")}
                          onMouseLeave={e => (e.currentTarget.style.background = "#8B5CF6")}
                        >
                          BOOK FREE CALL
                        </button>
                        <button
                          onClick={() => { setPhase("idle"); setLines([]); setConnIdx(0); }}
                          style={{
                            padding: "10px 16px",
                            background: "transparent",
                            color: "rgba(232,228,216,0.35)",
                            border: "1px solid rgba(232,228,216,0.12)",
                            borderRadius: 4,
                            fontSize: 10,
                            fontFamily: "inherit",
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                          }}
                        >
                          RESCAN
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
