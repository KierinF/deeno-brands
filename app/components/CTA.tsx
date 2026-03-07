"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";
import { Phone, Mail, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import MagneticButton from "./MagneticButton";

type FormState = "idle" | "submitting" | "success";

const perks = [
  "Free 30-min strategy call — no pitch",
  "Full competitor analysis included",
  "Zero commitment required",
  "Results within 30 days or we adjust",
];

export default function CTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [formState, setFormState] = useState<FormState>("idle");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState("submitting");
    await new Promise((r) => setTimeout(r, 1400));
    setFormState("success");
  };

  return (
    <section id="contact" ref={ref} style={{ background: "#F5EDD8", color: "#1A1510" }}>
      <div className="max-w-6xl mx-auto px-6 py-28">
        <div className="grid lg:grid-cols-[1fr_420px] gap-16 items-start">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            <span
              style={{
                fontFamily: '"SF Mono","Fira Code",monospace',
                fontSize: 9,
                letterSpacing: "0.2em",
                color: "rgba(201,168,76,0.6)",
                textTransform: "uppercase",
                display: "block",
                marginBottom: 16,
              }}
            >
              [ BEGIN SURVIVAL PROTOCOL ]
            </span>
            <h2
              className="mb-6"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "clamp(32px, 5vw, 68px)",
                color: "#1A1510",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}
            >
              Ready to evolve?
            </h2>
            <p className="leading-relaxed mb-10 max-w-md text-[15px]" style={{ color: "rgba(26,21,16,0.5)" }}>
              Book your free growth audit. We&apos;ll review your current marketing,
              identify quick wins, and show you exactly how we&apos;d take your
              business to #1 in your market.
            </p>

            <div className="space-y-4 mb-12">
              {perks.map((p) => (
                <div key={p} className="flex items-center gap-3">
                  <CheckCircle2 size={14} style={{ color: "#8B5CF6", flexShrink: 0 }} />
                  <span className="text-sm" style={{ color: "rgba(26,21,16,0.55)" }}>{p}</span>
                </div>
              ))}
            </div>

            {/* Contact */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="tel:+16315214302"
                className="flex items-center gap-3 rounded-xl px-5 py-3.5 transition-colors"
                style={{ background: "rgba(26,21,16,0.06)", border: "1px solid rgba(26,21,16,0.1)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(26,21,16,0.1)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(26,21,16,0.06)")}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(139,92,246,0.1)" }}
                >
                  <Phone size={13} style={{ color: "#8B5CF6" }} />
                </div>
                <div>
                  <div className="text-[10px]" style={{ color: "rgba(26,21,16,0.4)" }}>Call us</div>
                  <div className="font-semibold text-sm" style={{ color: "#1A1510" }}>(631) 521-4302</div>
                </div>
              </a>
              <a
                href="mailto:kierin@deenobrands.agency"
                className="flex items-center gap-3 rounded-xl px-5 py-3.5 transition-colors"
                style={{ background: "rgba(26,21,16,0.06)", border: "1px solid rgba(26,21,16,0.1)" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(26,21,16,0.1)")}
                onMouseLeave={e => (e.currentTarget.style.background = "rgba(26,21,16,0.06)")}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(139,92,246,0.1)" }}
                >
                  <Mail size={13} style={{ color: "#8B5CF6" }} />
                </div>
                <div>
                  <div className="text-[10px]" style={{ color: "rgba(26,21,16,0.4)" }}>Email</div>
                  <div className="font-semibold text-sm" style={{ color: "#1A1510" }}>kierin@deenobrands.agency</div>
                </div>
              </a>
            </div>
          </motion.div>

          {/* Form card */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: "#fff",
              border: "1px solid rgba(26,21,16,0.08)",
              boxShadow: "0 4px 40px rgba(26,21,16,0.08)",
              minHeight: 500,
            }}
          >
            <AnimatePresence mode="wait">
              {formState !== "success" ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-7"
                >
                  <h3
                    className="mb-1"
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: 22,
                      color: "#1A1510",
                    }}
                  >
                    Get Your Free Audit
                  </h3>
                  <p className="text-sm mb-6" style={{ color: "rgba(26,21,16,0.4)" }}>Takes 2 minutes. No spam, ever.</p>

                  <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-2 gap-3">
                      {["First Name", "Last Name"].map((label) => (
                        <div key={label}>
                          <label className="text-xs mb-1.5 block" style={{ color: "rgba(26,21,16,0.4)" }}>{label}</label>
                          <input
                            type="text"
                            required
                            placeholder={label === "First Name" ? "John" : "Smith"}
                            className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                            style={{
                              background: "#F5EDD8",
                              border: "1px solid #DDD4C0",
                              color: "#1A1510",
                            }}
                            onFocus={e => (e.target.style.borderColor = "rgba(139,92,246,0.5)")}
                            onBlur={e => (e.target.style.borderColor = "#DDD4C0")}
                          />
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="text-xs mb-1.5 block" style={{ color: "rgba(26,21,16,0.4)" }}>Business Email</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@yourbusiness.com"
                        className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                        style={{ background: "#F5EDD8", border: "1px solid #DDD4C0", color: "#1A1510" }}
                        onFocus={e => (e.target.style.borderColor = "rgba(139,92,246,0.5)")}
                        onBlur={e => (e.target.style.borderColor = "#DDD4C0")}
                      />
                    </div>

                    <div>
                      <label className="text-xs mb-1.5 block" style={{ color: "rgba(26,21,16,0.4)" }}>Phone Number</label>
                      <input
                        type="tel"
                        placeholder="(555) 000-0000"
                        className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors"
                        style={{ background: "#F5EDD8", border: "1px solid #DDD4C0", color: "#1A1510" }}
                        onFocus={e => (e.target.style.borderColor = "rgba(139,92,246,0.5)")}
                        onBlur={e => (e.target.style.borderColor = "#DDD4C0")}
                      />
                    </div>

                    <div>
                      <label className="text-xs mb-1.5 block" style={{ color: "rgba(26,21,16,0.4)" }}>Your Trade</label>
                      <select
                        className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors appearance-none"
                        style={{ background: "#F5EDD8", border: "1px solid #DDD4C0", color: "rgba(26,21,16,0.6)" }}
                        onFocus={e => (e.target.style.borderColor = "rgba(139,92,246,0.5)")}
                        onBlur={e => (e.target.style.borderColor = "#DDD4C0")}
                      >
                        <option value="">Select your trade...</option>
                        {["HVAC", "Plumbing", "Roofing", "Electrical", "Landscaping", "Pest Control", "Cleaning", "Other"].map(
                          (t) => <option key={t} value={t}>{t}</option>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs mb-1.5 block" style={{ color: "rgba(26,21,16,0.4)" }}>Monthly Marketing Budget</label>
                      <select
                        className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-colors appearance-none"
                        style={{ background: "#F5EDD8", border: "1px solid #DDD4C0", color: "rgba(26,21,16,0.6)" }}
                        onFocus={e => (e.target.style.borderColor = "rgba(139,92,246,0.5)")}
                        onBlur={e => (e.target.style.borderColor = "#DDD4C0")}
                      >
                        <option value="">Select budget...</option>
                        {["Under $1,000", "$1,000–$3,000", "$3,000–$7,000", "$7,000–$15,000", "$15,000+"].map(
                          (b) => <option key={b} value={b}>{b}</option>
                        )}
                      </select>
                    </div>

                    <MagneticButton className="w-full" strength={0.15}>
                      <button
                        type="submit"
                        disabled={formState === "submitting"}
                        className="w-full text-white font-bold py-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-sm"
                        style={{
                          background: formState === "submitting" ? "rgba(139,92,246,0.7)" : "#8B5CF6",
                        }}
                        onMouseEnter={e => {
                          if (formState !== "submitting") {
                            (e.currentTarget as HTMLButtonElement).style.background = "#7C3AED";
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 30px rgba(139,92,246,0.4)";
                          }
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLButtonElement).style.background = "#8B5CF6";
                          (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                        }}
                      >
                        {formState === "submitting" ? (
                          <>
                            <Loader2 size={15} className="animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            Book My Free Audit
                            <ArrowRight size={15} />
                          </>
                        )}
                      </button>
                    </MagneticButton>

                    <p className="text-center text-xs" style={{ color: "rgba(26,21,16,0.25)" }}>
                      No credit card. No commitment. Just a real strategy call.
                    </p>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="p-7 flex flex-col items-center justify-center text-center h-full"
                  style={{ minHeight: 500 }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
                    style={{ background: "rgba(139,92,246,0.1)" }}
                  >
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                      <motion.path
                        d="M5 14l7 7L23 7"
                        stroke="#8B5CF6"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                      />
                    </svg>
                  </motion.div>

                  <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-3"
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: 26,
                      color: "#1A1510",
                    }}
                  >
                    You&apos;re in.
                  </motion.h3>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.55 }}
                    className="text-sm leading-relaxed mb-8 max-w-xs"
                    style={{ color: "rgba(26,21,16,0.5)" }}
                  >
                    We&apos;ll reach out within 24 hours
                    {email ? ` at ${email}` : ""}.
                    <br />Kierin personally reviews every submission.
                  </motion.p>

                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="w-16 h-px mb-8"
                    style={{ background: "rgba(26,21,16,0.1)" }}
                  />

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="space-y-3 w-full max-w-xs"
                  >
                    <p
                      className="text-xs uppercase mb-3"
                      style={{
                        fontFamily: '"SF Mono","Fira Code",monospace',
                        letterSpacing: "0.15em",
                        color: "rgba(26,21,16,0.35)",
                      }}
                    >
                      Or reach us directly
                    </p>
                    <a
                      href="tel:+16315214302"
                      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors"
                      style={{ background: "rgba(26,21,16,0.04)", border: "1px solid rgba(26,21,16,0.08)" }}
                    >
                      <Phone size={13} style={{ color: "#8B5CF6", flexShrink: 0 }} />
                      <span className="font-semibold text-sm" style={{ color: "#1A1510" }}>(631) 521-4302</span>
                    </a>
                    <a
                      href="mailto:kierin@deenobrands.agency"
                      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors"
                      style={{ background: "rgba(26,21,16,0.04)", border: "1px solid rgba(26,21,16,0.08)" }}
                    >
                      <Mail size={13} style={{ color: "#8B5CF6", flexShrink: 0 }} />
                      <span className="font-semibold text-sm" style={{ color: "#1A1510" }}>kierin@deenobrands.agency</span>
                    </a>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
