"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

type Phase = "idle" | "scanning" | "done" | "email" | "phone" | "complete";

// Status lines typed before real response arrives
const CONNECTING_LINES = [
  "> Resolving domain...",
  "> Fetching homepage HTML...",
  "> Checking Google Business signals...",
  "> Scanning for tracking pixels...",
  "> Analyzing on-page SEO...",
  "> Checking conversion elements...",
  "> Running scoring engine...",
];

// Colors
const BG = "#1C1917";
const TITLE_BAR = "#181510";
const BORDER = "rgba(139,92,246,0.25)";
const ACCENT = "#8B5CF6";
const ACCENT_HOVER = "#7C3AED";
const TEXT = "#EDEAE0";
const TEXT_DIM = "rgba(232,228,216,0.55)";
const ACCENT_DIM = "rgba(139,92,246,0.55)";

interface Props {
  open: boolean;
  onClose: () => void;
  onAuditStart?: () => void;
  onAuditProgress?: (pct: number) => void;
  onAuditDone?: () => void;
}

export default function ExtinctionTerminal({ open, onClose, onAuditStart, onAuditProgress, onAuditDone }: Props) {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [lines, setLines] = useState<string[]>([]);
  const [connIdx, setConnIdx] = useState(0);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const connTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const streamStartedRef = useRef(false);
  const linesReceivedRef = useRef(0);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Don't abort on modal close — let scan keep running in background for progress bar
  // Only reset UI state when reopened in idle phase
  useEffect(() => {
    if (!open && phase === "idle") {
      if (connTimerRef.current) clearTimeout(connTimerRef.current);
      setLines([]);
      setConnIdx(0);
    }
  }, [open, phase]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  // Type out connecting lines while waiting for API response
  useEffect(() => {
    if (phase !== "scanning") return;
    if (streamStartedRef.current) return; // stop if real stream started
    if (connIdx >= CONNECTING_LINES.length) return;

    connTimerRef.current = setTimeout(() => {
      setLines(prev => [...prev, CONNECTING_LINES[connIdx]]);
      setConnIdx(i => i + 1);
    }, connIdx === 0 ? 0 : 400 + Math.random() * 200);

    return () => { if (connTimerRef.current) clearTimeout(connTimerRef.current); };
  }, [phase, connIdx]);

  function handleClose() {
    // Don't abort if scanning — let it continue in background
    if (phase === "idle" || phase === "done" || phase === "email" || phase === "phone" || phase === "complete") {
      abortRef.current?.abort();
    }
    onClose();
  }

  async function runScan() {
    const trimmed = url.trim();
    if (!trimmed) return;

    console.log("[audit] ▶ runScan triggered — scanning url:", trimmed);

    abortRef.current = new AbortController();
    streamStartedRef.current = false;
    linesReceivedRef.current = 0;
    setPhase("scanning");
    setLines([]);
    setConnIdx(0);
    onAuditStart?.();
    onAuditProgress?.(10);

    const fetchUrl = "/api/analyze";
    console.log("[audit] fetching:", fetchUrl, "method: POST");

    try {
      const res = await fetch(fetchUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
        signal: abortRef.current.signal,
        cache: "reload",
      });

      console.log("[audit] response — status:", res.status, res.statusText, "| final url:", res.url, "| ok:", res.ok);

      if (!res.ok || !res.body) {
        console.error("[audit] ✗ request failed — status:", res.status, "| This may be a 405 (wrong method) or 404 (route not found). Final URL after redirects:", res.url);
        setLines(prev => [...prev, "", `> Error: ${res.status} — ${res.statusText}`]);
        setPhase("done");
        onAuditDone?.();
        return;
      }

      // Real stream started — clear connecting lines
      streamStartedRef.current = true;
      if (connTimerRef.current) clearTimeout(connTimerRef.current);
      setLines([]);
      onAuditProgress?.(35);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const parts = buffer.split("\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          linesReceivedRef.current++;
          setLines(prev => [...prev, part]);
          // Report progress as lines stream in
          const pct = Math.min(90, 35 + linesReceivedRef.current * 2.5);
          onAuditProgress?.(pct);
        }
      }
      if (buffer) setLines(prev => [...prev, buffer]);
      setPhase("done");
      onAuditDone?.();

    } catch (err: unknown) {
      if ((err as { name?: string }).name === "AbortError") return;
      console.error("[audit] ✗ fetch threw error:", err);
      setLines(prev => [...prev, "", "> Scan aborted — could not reach the URL."]);
      setPhase("done");
      onAuditDone?.();
    }
  }

  async function submitEmail() {
    if (!email.trim()) return;
    setPhase("email");
    // Send lead data via contact API
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "audit-report", website: url }),
      });
    } catch { /* non-blocking */ }
  }

  async function submitPhone() {
    if (!phone.trim()) return;
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), phone: phone.trim(), source: "audit-report", website: url }),
      });
    } catch { /* non-blocking */ }
    setPhase("complete");
  }

  function handleBookCall() {
    handleClose();
    setTimeout(() => {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    }, 400);
  }

  function lineStyle(line: string): React.CSSProperties {
    if (line.includes("✗") || line.includes("NONE") || line.includes("MISSING") || line.includes("NOT FOUND") || line.includes("WEAK")) {
      return { color: "#D4522A" };
    }
    if (line.includes("⚠") || line.includes("GENERIC") || line.includes("BLOCKED") || line.includes("SLOW") || line.includes("BELOW") || line.includes("TIMEOUT") || line.includes("PARTIAL")) {
      return { color: "#C9A84C" };
    }
    if (line.includes("SECTION SCORE") || line.includes("FINAL SCORE") || line.includes("GRADE")) {
      return { color: ACCENT, fontWeight: "bold" };
    }
    if (line.includes("━") || line.includes("SCAN COMPLETE") || line.includes("TOP 3")) {
      return { color: ACCENT_DIM, fontWeight: "bold" };
    }
    if (line.startsWith(">") || /^\d\./.test(line)) {
      return { color: TEXT };
    }
    // Section headers (━━━ GOOGLE PRESENCE ━━━ etc.)
    if (/^━━━\s/.test(line)) {
      return { color: ACCENT, fontWeight: "bold" };
    }
    return { color: TEXT_DIM };
  }

  const inputStyle: React.CSSProperties = {
    background: "#111",
    border: `1px solid ${BORDER}`,
    borderRadius: 4,
    padding: "10px 12px",
    color: TEXT,
    fontSize: 12,
    fontFamily: '"SF Mono","Fira Code","Fira Mono",monospace',
    outline: "none",
    width: "100%",
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8"
          style={{ background: "rgba(12,10,8,0.92)", backdropFilter: "blur(8px)" }}
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
                background: BG,
                border: `1px solid ${BORDER}`,
                borderRadius: 8,
                boxShadow: `0 0 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.08)`,
                fontFamily: '"SF Mono","Fira Code","Fira Mono",monospace',
              }}
            >
              {/* Title bar */}
              <div
                style={{
                  background: TITLE_BAR,
                  borderBottom: `1px solid ${BORDER}`,
                  padding: "10px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  borderRadius: "8px 8px 0 0",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 10, letterSpacing: "0.15em", color: ACCENT }}>
                    DEENO EXTINCTION SCANNER v3.0
                  </span>
                  {phase === "scanning" && (
                    <span
                      style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: ACCENT,
                        display: "inline-block",
                        animation: "blink 0.8s step-end infinite",
                      }}
                    />
                  )}
                </div>
                <button
                  onClick={handleClose}
                  style={{ color: "rgba(232,228,216,0.35)", display: "flex", background: "none", border: "none", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.color = TEXT)}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(232,228,216,0.35)")}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: "20px 20px 16px", minHeight: 400, display: "flex", flexDirection: "column" }}>

                {/* ── IDLE — URL input ── */}
                {phase === "idle" && (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <p style={{ fontSize: 10, letterSpacing: "0.1em", color: ACCENT_DIM, marginBottom: 24, textTransform: "uppercase" }}>
                      Drop your website. We&apos;ll tell you what&apos;s broken.
                    </p>

                    <div style={{ marginBottom: 12, position: "relative" }}>
                      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: ACCENT, fontSize: 12 }}>$</span>
                      <input
                        type="url"
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") runScan(); }}
                        placeholder="yourbusiness.com"
                        autoFocus
                        style={{ ...inputStyle, paddingLeft: 26 }}
                        onFocus={e => (e.target.style.borderColor = `rgba(139,92,246,0.7)`)}
                        onBlur={e => (e.target.style.borderColor = BORDER)}
                      />
                    </div>

                    <button
                      onClick={runScan}
                      disabled={!url.trim()}
                      style={{
                        width: "100%",
                        padding: "12px",
                        background: url.trim() ? ACCENT : "rgba(139,92,246,0.3)",
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        fontSize: 12,
                        fontFamily: "inherit",
                        letterSpacing: "0.12em",
                        cursor: url.trim() ? "pointer" : "not-allowed",
                        marginBottom: 16,
                        textTransform: "uppercase",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={e => { if (url.trim()) (e.currentTarget.style.background = ACCENT_HOVER); }}
                      onMouseLeave={e => { if (url.trim()) (e.currentTarget.style.background = ACCENT); }}
                    >
                      GENERATE AUDIT
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 8h12M9 3l5 5-5 5" />
                      </svg>
                    </button>

                    <p style={{ fontSize: 9, color: "rgba(139,92,246,0.3)", textAlign: "center", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      We don&apos;t save the results. Promise. · ESC to close
                    </p>
                  </div>
                )}

                {/* ── SCANNING / DONE — terminal output ── */}
                {(phase === "scanning" || phase === "done" || phase === "email" || phase === "phone" || phase === "complete") && (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <p style={{ fontSize: 9, color: ACCENT_DIM, marginBottom: 12, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      SCANNING: {url}
                    </p>

                    <div
                      ref={scrollRef}
                      style={{
                        flex: 1,
                        overflowY: "auto",
                        maxHeight: 280,
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

                    {/* ── DONE — email capture ── */}
                    {phase === "done" && (
                      <div style={{ borderTop: `1px solid rgba(139,92,246,0.15)`, paddingTop: 14 }}>
                        <p style={{ fontSize: 9, color: ACCENT_DIM, marginBottom: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                          Want the full PDF report?
                        </p>
                        <div style={{ display: "flex", gap: 8 }}>
                          <input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") submitEmail(); }}
                            style={{ ...inputStyle, flex: 1 }}
                            onFocus={e => (e.target.style.borderColor = `rgba(139,92,246,0.7)`)}
                            onBlur={e => (e.target.style.borderColor = BORDER)}
                          />
                          <button
                            onClick={submitEmail}
                            disabled={!email.trim()}
                            style={{
                              padding: "10px 16px",
                              background: email.trim() ? ACCENT : "rgba(139,92,246,0.3)",
                              color: "#fff",
                              border: "none",
                              borderRadius: 4,
                              fontSize: 10,
                              fontFamily: "inherit",
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              cursor: email.trim() ? "pointer" : "not-allowed",
                              transition: "background 0.15s",
                              whiteSpace: "nowrap",
                            }}
                            onMouseEnter={e => { if (email.trim()) (e.currentTarget.style.background = ACCENT_HOVER); }}
                            onMouseLeave={e => { if (email.trim()) (e.currentTarget.style.background = email.trim() ? ACCENT : "rgba(139,92,246,0.3)"); }}
                          >
                            SEND IT →
                          </button>
                        </div>
                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                          <button
                            onClick={handleBookCall}
                            style={{ flex: 1, padding: "8px", background: "transparent", color: "rgba(232,228,216,0.3)", border: `1px solid rgba(232,228,216,0.1)`, borderRadius: 4, fontSize: 9, fontFamily: "inherit", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
                            onMouseEnter={e => { (e.currentTarget.style.color = TEXT); (e.currentTarget.style.borderColor = "rgba(232,228,216,0.3)"); }}
                            onMouseLeave={e => { (e.currentTarget.style.color = "rgba(232,228,216,0.3)"); (e.currentTarget.style.borderColor = "rgba(232,228,216,0.1)"); }}
                          >
                            Skip — Book Free Call
                          </button>
                          <button
                            onClick={() => { setPhase("idle"); setLines([]); setConnIdx(0); streamStartedRef.current = false; }}
                            style={{ padding: "8px 12px", background: "transparent", color: "rgba(232,228,216,0.25)", border: `1px solid rgba(232,228,216,0.08)`, borderRadius: 4, fontSize: 9, fontFamily: "inherit", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
                          >
                            Rescan
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ── EMAIL phase — phone ask ── */}
                    {phase === "email" && (
                      <div style={{ borderTop: `1px solid rgba(139,92,246,0.15)`, paddingTop: 14 }}>
                        <p style={{ fontSize: 10, color: TEXT, marginBottom: 4 }}>Report on its way to <span style={{ color: ACCENT }}>{email}</span></p>
                        <p style={{ fontSize: 9, color: ACCENT_DIM, marginBottom: 10, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                          What&apos;s the best number to reach you?
                        </p>
                        <div style={{ display: "flex", gap: 8 }}>
                          <input
                            type="tel"
                            placeholder="(555) 000-0000"
                            value={phone}
                            onChange={e => setPhone(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") submitPhone(); }}
                            autoFocus
                            style={{ ...inputStyle, flex: 1 }}
                            onFocus={e => (e.target.style.borderColor = `rgba(139,92,246,0.7)`)}
                            onBlur={e => (e.target.style.borderColor = BORDER)}
                          />
                          <button
                            onClick={submitPhone}
                            style={{
                              padding: "10px 16px",
                              background: ACCENT,
                              color: "#fff",
                              border: "none",
                              borderRadius: 4,
                              fontSize: 10,
                              fontFamily: "inherit",
                              letterSpacing: "0.1em",
                              textTransform: "uppercase",
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                              transition: "background 0.15s",
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background = ACCENT_HOVER)}
                            onMouseLeave={e => (e.currentTarget.style.background = ACCENT)}
                          >
                            DONE →
                          </button>
                        </div>
                        <button
                          onClick={() => setPhase("complete")}
                          style={{ marginTop: 8, background: "none", border: "none", color: "rgba(232,228,216,0.25)", fontSize: 9, fontFamily: "inherit", letterSpacing: "0.08em", cursor: "pointer", textDecoration: "underline" }}
                        >
                          Skip phone
                        </button>
                      </div>
                    )}

                    {/* ── COMPLETE — final CTA ── */}
                    {(phase === "phone" || phase === "complete") && (
                      <div style={{ borderTop: `1px solid rgba(139,92,246,0.15)`, paddingTop: 14 }}>
                        <p style={{ fontSize: 11, color: TEXT, marginBottom: 4, lineHeight: 1.5 }}>
                          You&apos;re all set. Full report incoming within 24h.
                        </p>
                        <p style={{ fontSize: 9, color: ACCENT_DIM, marginBottom: 12, letterSpacing: "0.08em" }}>
                          Want to talk through the results sooner?
                        </p>
                        <button
                          onClick={handleBookCall}
                          style={{
                            width: "100%",
                            padding: "11px",
                            background: ACCENT,
                            color: "#fff",
                            border: "none",
                            borderRadius: 4,
                            fontSize: 10,
                            fontFamily: "inherit",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            cursor: "pointer",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = ACCENT_HOVER)}
                          onMouseLeave={e => (e.currentTarget.style.background = ACCENT)}
                        >
                          BOOK FREE CALL →
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
