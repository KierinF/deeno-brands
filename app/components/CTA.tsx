"use client";

import { useState } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

export default function CTA() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [submittedEmail, setSubmittedEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormState("submitting");
    try {
      const fd = new FormData(e.currentTarget);
      const payload = {
        firstName: fd.get("firstName"),
        lastName: fd.get("lastName"),
        email: fd.get("email"),
        phone: fd.get("phone"),
        trade: fd.get("trade"),
        revenue: fd.get("revenue"),
        challenge: fd.get("challenge"),
      };
      setSubmittedEmail(payload.email as string);
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        cache: "reload",
      });
      if (!res.ok) throw new Error("send failed");
      setFormState("success");
    } catch {
      setFormState("error");
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#1C1C1C",
    border: "1px solid #2A2A2A",
    padding: "12px 14px",
    fontSize: 13,
    color: "#F5F5F2",
    fontFamily: "'DM Sans Variable', 'DM Sans', sans-serif",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace",
    fontSize: 10,
    letterSpacing: "1.5px",
    textTransform: "uppercase" as const,
    color: "#444",
    display: "block",
    marginBottom: 6,
  };

  return (
    <section
      id="contact"
      style={{ background: "#0A0A0A", borderBottom: "1px solid #2A2A2A", padding: "80px 40px" }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 56 }}>
          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(42px, 6vw, 72px)",
              letterSpacing: "2px",
              color: "#F5F5F2",
              lineHeight: 0.95,
              marginBottom: 20,
            }}
          >
            Your market might already be taken.<br />
            <span style={{ color: "#E8FF47" }}>Check before someone else does.</span>
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "#666",
              lineHeight: 1.7,
              maxWidth: 580,
            }}
          >
            Book a free 30-minute Commercial Pipeline Audit. We&apos;ll map your target market, name the decision-makers holding the contracts you want, and show you exactly what your first outbound campaign would look like. Whether we work together or not, you&apos;ll leave with a clear picture of your commercial opportunity.
          </p>
        </div>

        {/* Two-column layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1,
            background: "#2A2A2A",
            border: "1px solid #2A2A2A",
          }}
        >
          {/* Left: what you get */}
          <div style={{ background: "#111111", padding: "40px" }}>
            <h3
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 28,
                letterSpacing: "2px",
                color: "#F5F5F2",
                marginBottom: 24,
              }}
            >
              WHAT YOU GET ON THE CALL
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                { title: "Your market mapped.", body: "We identify your top commercial buyer segments in your specific geography." },
                { title: "Decision-makers named.", body: "We show you exactly who holds the contracts you want and how to reach them." },
                { title: "Campaign preview.", body: "We outline your first outbound campaign — channels, copy approach, target list size." },
                { title: "Territory check.", body: "We confirm whether your market is available. If it's taken, we put you on the waitlist." },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <span style={{ color: "#E8FF47", fontSize: 14, flexShrink: 0, marginTop: 2 }}>→</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#F5F5F2", marginBottom: 4 }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 13, color: "#666", lineHeight: 1.5 }}>
                      {item.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid #2A2A2A" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a
                  href="tel:+16315214302"
                  style={{ fontSize: 13, color: "#444", textDecoration: "none", transition: "color 0.2s", display: "flex", alignItems: "center", gap: 8 }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#F5F5F2")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#444")}
                >
                  <span style={{ color: "#E8FF47", fontSize: 10 }}>→</span>
                  (631) 521-4302
                </a>
                <a
                  href="mailto:kierin@deenobrands.agency"
                  style={{ fontSize: 13, color: "#444", textDecoration: "none", transition: "color 0.2s", display: "flex", alignItems: "center", gap: 8 }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#F5F5F2")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#444")}
                >
                  <span style={{ color: "#E8FF47", fontSize: 10 }}>→</span>
                  kierin@deenobrands.agency
                </a>
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div style={{ background: "#161616", padding: "40px" }}>
            {formState === "success" ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 20,
                  height: "100%",
                  justifyContent: "center",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background: "rgba(232,255,71,0.1)",
                    border: "1px solid rgba(232,255,71,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                  }}
                >
                  ✓
                </div>
                <h3
                  style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: 36,
                    letterSpacing: "2px",
                    color: "#F5F5F2",
                  }}
                >
                  YOU&apos;RE IN.
                </h3>
                <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6, maxWidth: 320 }}>
                  We&apos;ll review your info and reach out within 24 hours
                  {submittedEmail ? ` at ${submittedEmail}` : ""}. Kierin personally reviews every submission.
                </p>
                <div
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 11,
                    color: "#E8FF47",
                    letterSpacing: "1.5px",
                  }}
                >
                  1 CLIENT PER MARKET — YOUR SPOT IS BEING HELD.
                </div>
              </div>
            ) : (
              <>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    {[
                      { label: "First Name", name: "firstName", placeholder: "John", type: "text" },
                      { label: "Last Name", name: "lastName", placeholder: "Smith", type: "text" },
                    ].map((f) => (
                      <div key={f.name}>
                        <label style={labelStyle}>{f.label}</label>
                        <input
                          type={f.type}
                          name={f.name}
                          required
                          placeholder={f.placeholder}
                          style={inputStyle}
                          onFocus={(e) => (e.target.style.borderColor = "rgba(232,255,71,0.4)")}
                          onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label style={labelStyle}>Business Email</label>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="you@yourbusiness.com"
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "rgba(232,255,71,0.4)")}
                      onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="(555) 000-0000"
                      style={inputStyle}
                      onFocus={(e) => (e.target.style.borderColor = "rgba(232,255,71,0.4)")}
                      onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Your Trade</label>
                    <select
                      name="trade"
                      required
                      style={{ ...inputStyle, appearance: "none" as const }}
                      onFocus={(e) => (e.target.style.borderColor = "rgba(232,255,71,0.4)")}
                      onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                    >
                      <option value="">Select trade...</option>
                      {["HVAC", "Electrical", "Plumbing", "Landscaping", "Pest Control"].map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Annual Revenue</label>
                    <select
                      name="revenue"
                      style={{ ...inputStyle, appearance: "none" as const }}
                      onFocus={(e) => (e.target.style.borderColor = "rgba(232,255,71,0.4)")}
                      onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                    >
                      <option value="">Select range...</option>
                      {["Under $500K", "$500K–$1M", "$1M–$5M", "$5M–$15M", "$15M+"].map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={labelStyle}>Top Challenge</label>
                    <select
                      name="challenge"
                      style={{ ...inputStyle, appearance: "none" as const }}
                      onFocus={(e) => (e.target.style.borderColor = "rgba(232,255,71,0.4)")}
                      onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                    >
                      <option value="">Select challenge...</option>
                      {[
                        "No commercial leads",
                        "Can't reach facility managers",
                        "No outbound process",
                        "Want to reduce referral dependency",
                        "Other",
                      ].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={formState === "submitting"}
                    style={{
                      width: "100%",
                      padding: "16px",
                      background: formState === "error" ? "#FF4A4A" : "#E8FF47",
                      color: "#0A0A0A",
                      border: "none",
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 12,
                      letterSpacing: "1.5px",
                      fontWeight: 500,
                      cursor: formState === "submitting" ? "not-allowed" : "pointer",
                      opacity: formState === "submitting" ? 0.7 : 1,
                      transition: "background 0.15s, opacity 0.15s",
                    }}
                    onMouseEnter={(e) => { if (formState === "idle") (e.currentTarget.style.background = "#f0ff6e"); }}
                    onMouseLeave={(e) => { if (formState === "idle") (e.currentTarget.style.background = "#E8FF47"); }}
                  >
                    {formState === "submitting"
                      ? "SENDING..."
                      : formState === "error"
                      ? "FAILED — TRY AGAIN"
                      : "BOOK MY FREE PIPELINE AUDIT →"}
                  </button>
                  <p style={{ textAlign: "center", fontSize: 11, color: "#333" }}>
                    No credit card. No commitment. We review every submission personally.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
