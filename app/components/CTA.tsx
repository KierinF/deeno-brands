"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { Phone, Mail, ArrowRight, Loader2 } from "lucide-react";

type FormState = "idle" | "submitting" | "success" | "error";

export default function CTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [formState, setFormState] = useState<FormState>("idle");
  const [email, setEmail] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("[contact] ▶ form submit triggered");
    setFormState("submitting");
    try {
      const fd = new FormData(e.currentTarget);
      const payload = {
        firstName: fd.get("firstName"),
        lastName: fd.get("lastName"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        trade: fd.get("trade"),
        budget: fd.get("budget"),
      };
      console.log("[contact] sending to /api/contact — payload:", payload);
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "reload",
      });
      console.log("[contact] response — status:", res.status, res.statusText, "| final url:", res.url, "| ok:", res.ok);
      if (!res.ok) {
        console.error("[contact] ✗ failed — status:", res.status, "url after redirects:", res.url);
        throw new Error("send failed");
      }
      setFormState("success");
    } catch (err) {
      console.error("[contact] ✗ fetch error:", err);
      setFormState("error");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#fff",
    border: "1.5px solid rgba(28,25,23,0.15)",
    borderRadius: 8,
    padding: "11px 14px",
    fontSize: 13,
    color: "#1C1917",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.2s",
  };

  return (
    <section id="contact" ref={ref} style={{ background: "#1C1917", paddingTop: 80, paddingBottom: 80 }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-[1fr_420px] gap-16 items-start">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <p
              style={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: 9,
                letterSpacing: "0.08em",
                color: "rgba(237,234,224,0.3)",
                marginBottom: 24,
              }}
            >
              GET STARTED
            </p>
            <h2
              style={{
                fontFamily: '"Press Start 2P", monospace',
                fontSize: "clamp(18px, 3vw, 40px)",
                color: "#EDEAE0",
                lineHeight: 1.5,
                letterSpacing: "0.04em",
                marginBottom: 24,
              }}
            >
              Ready to<br />evolve?
            </h2>
            <p style={{ fontSize: 15, color: "rgba(237,234,224,0.45)", lineHeight: 1.7, marginBottom: 32, maxWidth: 380 }}>
              Free 30-min strategy call. We&apos;ll show you exactly what&apos;s broken and how to fix it.
              No pitch, no pressure.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {[
                "Free competitor analysis included",
                "Zero commitment required",
                "Results within 30 days or we adjust",
                "1 client per trade per city",
              ].map(p => (
                <div key={p} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ color: "#8B5CF6", fontSize: 12, flexShrink: 0 }}>—</span>
                  <span style={{ fontSize: 13, color: "rgba(237,234,224,0.45)" }}>{p}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <a href="tel:+16315214302" style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(237,234,224,0.35)", textDecoration: "none", fontSize: 13, transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#EDEAE0")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(237,234,224,0.35)")}>
                <Phone size={13} style={{ color: "#8B5CF6", flexShrink: 0 }} />
                (631) 521-4302
              </a>
              <a href="mailto:kierin@deenobrands.agency" style={{ display: "flex", alignItems: "center", gap: 10, color: "rgba(237,234,224,0.35)", textDecoration: "none", fontSize: 13, transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#EDEAE0")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(237,234,224,0.35)")}>
                <Mail size={13} style={{ color: "#8B5CF6", flexShrink: 0 }} />
                kierin@deenobrands.agency
              </a>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              background: "#EDEAE0",
              borderRadius: 12,
              overflow: "hidden",
              minHeight: 480,
            }}
          >
            <AnimatePresence mode="wait">
              {formState !== "success" ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.25 }}
                  style={{ padding: 28 }}
                >
                  <h3
                    style={{
                      fontFamily: '"Press Start 2P", monospace',
                      fontSize: 12,
                      color: "#1C1917",
                      marginBottom: 6,
                      lineHeight: 1.5,
                    }}
                  >
                    Free Audit
                  </h3>
                  <p style={{ fontSize: 12, color: "#8B7F72", marginBottom: 20 }}>2 minutes. No spam, ever.</p>

                  <form ref={formRef} onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {[{ label: "First Name", name: "firstName", placeholder: "John" }, { label: "Last Name", name: "lastName", placeholder: "Smith" }].map(f => (
                        <div key={f.name}>
                          <label style={{ fontSize: 11, color: "rgba(28,25,23,0.4)", display: "block", marginBottom: 5 }}>{f.label}</label>
                          <input type="text" name={f.name} required placeholder={f.placeholder} style={inputStyle}
                            onFocus={e => (e.target.style.borderColor = "rgba(139,92,246,0.5)")}
                            onBlur={e => (e.target.style.borderColor = "rgba(28,25,23,0.15)")}
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: "rgba(28,25,23,0.4)", display: "block", marginBottom: 5 }}>Business Email</label>
                      <input type="email" name="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@yourbusiness.com" style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = "rgba(139,92,246,0.5)")}
                        onBlur={e => (e.target.style.borderColor = "rgba(28,25,23,0.15)")}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: "rgba(28,25,23,0.4)", display: "block", marginBottom: 5 }}>Phone</label>
                      <input type="tel" name="phone" required placeholder="(555) 000-0000" style={inputStyle}
                        onFocus={e => (e.target.style.borderColor = "rgba(139,92,246,0.5)")}
                        onBlur={e => (e.target.style.borderColor = "rgba(28,25,23,0.15)")}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: "rgba(28,25,23,0.4)", display: "block", marginBottom: 5 }}>Your Trade</label>
                      <select name="trade" style={{ ...inputStyle, appearance: "none" }}
                        onFocus={e => (e.target.style.borderColor = "rgba(139,92,246,0.5)")}
                        onBlur={e => (e.target.style.borderColor = "rgba(28,25,23,0.15)")}
                      >
                        <option value="">Select trade...</option>
                        {["HVAC", "Plumbing", "Roofing", "Electrical", "Landscaping", "Pest Control", "Cleaning", "Other"].map(t => (
                          <option key={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: "rgba(28,25,23,0.4)", display: "block", marginBottom: 5 }}>Monthly Budget</label>
                      <select name="budget" style={{ ...inputStyle, appearance: "none" }}
                        onFocus={e => (e.target.style.borderColor = "rgba(139,92,246,0.5)")}
                        onBlur={e => (e.target.style.borderColor = "rgba(28,25,23,0.15)")}
                      >
                        <option value="">Select budget...</option>
                        {["Under $1k", "$1k–$3k", "$3k–$7k", "$7k–$15k", "$15k+"].map(b => (
                          <option key={b}>{b}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={formState === "submitting"}
                      style={{
                        width: "100%",
                        padding: "14px",
                        background: formState === "error" ? "#DC2626" : "#8B5CF6",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        fontFamily: '"Press Start 2P", monospace',
                        fontSize: 9,
                        letterSpacing: "0.08em",
                        cursor: formState === "submitting" ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={e => { if (formState === "idle") (e.currentTarget.style.background = "#7C3AED"); }}
                      onMouseLeave={e => (e.currentTarget.style.background = formState === "error" ? "#DC2626" : "#8B5CF6")}
                    >
                      {formState === "submitting" ? (
                        <><Loader2 size={14} className="animate-spin" /> SENDING...</>
                      ) : formState === "error" ? (
                        <>FAILED — TRY AGAIN</>
                      ) : (
                        <>BOOK FREE AUDIT <ArrowRight size={13} /></>
                      )}
                    </button>
                    <p style={{ textAlign: "center", fontSize: 10, color: "rgba(28,25,23,0.25)" }}>
                      No credit card. No commitment.
                    </p>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  style={{ padding: 28, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", minHeight: 480 }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                    style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(139,92,246,0.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <motion.path d="M4 12l6 6L20 6" stroke="#8B5CF6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.3 }} />
                    </svg>
                  </motion.div>
                  <h3 style={{ fontFamily: '"Press Start 2P", monospace', fontSize: 16, color: "#1C1917", marginBottom: 12 }}>
                    You&apos;re in.
                  </h3>
                  <p style={{ fontSize: 13, color: "#8B7F72", lineHeight: 1.6, marginBottom: 24, maxWidth: 260 }}>
                    We&apos;ll reach out within 24 hours{email ? ` at ${email}` : ""}. Kierin personally reviews every submission.
                  </p>
                  <a href="tel:+16315214302" style={{ fontSize: 13, color: "#1C1917", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
                    <Phone size={13} style={{ color: "#8B5CF6" }} /> (631) 521-4302
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
