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
    background: "#F7F4EE",
    border: "1px solid #C8C1B3",
    padding: "12px 14px",
    fontSize: 13,
    color: "#1C2B2B",
    fontFamily: "'DM Sans Variable', 'DM Sans', sans-serif",
    outline: "none",
    transition: "border-color 0.2s",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'DM Mono', monospace",
    fontSize: 10,
    letterSpacing: "1.5px",
    textTransform: "uppercase",
    color: "#8C8070",
    display: "block",
    marginBottom: 6,
  };

  const whatYouGet = [
    "A live territory check — available or waitlisted, confirmed on the call",
    "The names and titles of the decision-makers holding the contracts you want",
    "Your commercial buyer segments mapped by geography",
    "A preview of your first outbound campaign — channels, copy approach, list size",
  ];

  return (
    <section
      id="contact"
      className="rsp-section-pad"
      style={{ background: "#F7F4EE", borderBottom: "1px solid #C8C1B3", padding: "80px 40px" }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ marginBottom: 56 }}>
          <div
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: "#E8A020",
              letterSpacing: "3px",
              textTransform: "uppercase",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span style={{ display: "block", width: 32, height: 1, background: "#E8A020" }} />
            Book your audit
          </div>
          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(42px, 6vw, 72px)",
              letterSpacing: "2px",
              color: "#1C2B2B",
              lineHeight: 0.95,
              marginBottom: 20,
            }}
          >
            Your market may still be open.
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 580 }}>
            <p style={{ fontSize: 15, color: "#8C8070", lineHeight: 1.7 }}>One client per trade, per geography.</p>
            <p style={{ fontSize: 15, color: "#8C8070", lineHeight: 1.7 }}>
              When a territory closes, the next operator in that trade goes on a waitlist.
            </p>
            <p style={{ fontSize: 16, color: "#1C2B2B", fontWeight: 500, lineHeight: 1.7 }}>
              Book a free 30-minute Commercial Pipeline Audit.
            </p>
            <p style={{ fontSize: 15, color: "#8C8070", lineHeight: 1.7 }}>
              Whether we work together or not, you&apos;ll leave with a clear picture of your commercial opportunity and whether your market is still available.
            </p>
          </div>
        </div>

        <div
          className="rsp-cta-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1,
            background: "#C8C1B3",
            border: "1px solid #C8C1B3",
          }}
        >
          {/* Left: what you get */}
          <div style={{ background: "#EEE9DF", padding: "40px" }}>
            <h3
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 28,
                letterSpacing: "2px",
                color: "#1C2B2B",
                marginBottom: 24,
              }}
            >
              WHAT YOU GET ON THE CALL
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {whatYouGet.map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <span style={{ color: "#E8A020", fontSize: 14, flexShrink: 0, marginTop: 2 }}>→</span>
                  <div style={{ fontSize: 14, color: "#8C8070", lineHeight: 1.55 }}>{item}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 40, paddingTop: 24, borderTop: "1px solid #C8C1B3" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a
                  href="tel:+16315214302"
                  style={{ fontSize: 13, color: "#8C8070", textDecoration: "none", transition: "color 0.2s", display: "flex", alignItems: "center", gap: 8 }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#1C2B2B")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#8C8070")}
                >
                  <span style={{ color: "#E8A020", fontSize: 10 }}>→</span>
                  (631) 521-4302
                </a>
                <a
                  href="mailto:kierin@deenobrands.agency"
                  style={{ fontSize: 13, color: "#8C8070", textDecoration: "none", transition: "color 0.2s", display: "flex", alignItems: "center", gap: 8 }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#1C2B2B")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#8C8070")}
                >
                  <span style={{ color: "#E8A020", fontSize: 10 }}>→</span>
                  kierin@deenobrands.agency
                </a>
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div style={{ background: "#F7F4EE", padding: "40px" }}>
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
                    background: "rgba(232,160,32,0.1)",
                    border: "1px solid rgba(232,160,32,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 20,
                    color: "#E8A020",
                  }}
                >
                  ✓
                </div>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: "2px", color: "#1C2B2B" }}>
                  YOU&apos;RE IN.
                </h3>
                <p style={{ fontSize: 14, color: "#8C8070", lineHeight: 1.6, maxWidth: 320 }}>
                  We&apos;ll review your info and reach out within 24 hours
                  {submittedEmail ? ` at ${submittedEmail}` : ""}. Kierin personally reviews every submission.
                </p>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#E8A020", letterSpacing: "1.5px" }}>
                  1 CLIENT PER MARKET — YOUR SPOT IS BEING HELD.
                </div>
              </div>
            ) : (
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
                        onFocus={(e) => (e.target.style.borderColor = "rgba(232,160,32,0.5)")}
                        onBlur={(e) => (e.target.style.borderColor = "#C8C1B3")}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label style={labelStyle}>Business Email</label>
                  <input
                    type="email" name="email" required placeholder="you@yourbusiness.com"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(232,160,32,0.5)")}
                    onBlur={(e) => (e.target.style.borderColor = "#C8C1B3")}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input
                    type="tel" name="phone" required placeholder="(555) 000-0000"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(232,160,32,0.5)")}
                    onBlur={(e) => (e.target.style.borderColor = "#C8C1B3")}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Your Trade</label>
                  <select
                    name="trade" required
                    style={{ ...inputStyle, appearance: "none" }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(232,160,32,0.5)")}
                    onBlur={(e) => (e.target.style.borderColor = "#C8C1B3")}
                  >
                    <option value="">Select trade...</option>
                    {["HVAC", "Commercial Cleaning", "Tree Care", "Waste Management", "Landscaping", "Pest Control", "Plumbing", "Roofing"].map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Annual Revenue</label>
                  <select
                    name="revenue"
                    style={{ ...inputStyle, appearance: "none" }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(232,160,32,0.5)")}
                    onBlur={(e) => (e.target.style.borderColor = "#C8C1B3")}
                  >
                    <option value="">Select range...</option>
                    {["Under $500K", "$500K\u2013$1M", "$1M\u2013$5M", "$5M\u2013$15M", "$15M+"].map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Top Challenge</label>
                  <select
                    name="challenge"
                    style={{ ...inputStyle, appearance: "none" }}
                    onFocus={(e) => (e.target.style.borderColor = "rgba(232,160,32,0.5)")}
                    onBlur={(e) => (e.target.style.borderColor = "#C8C1B3")}
                  >
                    <option value="">Select challenge...</option>
                    {["No commercial leads", "Can't reach facility managers", "No outbound process", "Want to reduce referral dependency", "Other"].map((c) => (
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
                    background: formState === "error" ? "#CC3311" : "#E8A020",
                    color: "#F7F4EE",
                    border: "none",
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 12,
                    letterSpacing: "1.5px",
                    fontWeight: 500,
                    cursor: formState === "submitting" ? "not-allowed" : "pointer",
                    opacity: formState === "submitting" ? 0.7 : 1,
                    transition: "background 0.15s, opacity 0.15s",
                  }}
                  onMouseEnter={(e) => { if (formState === "idle") (e.currentTarget.style.background = "#F0AA30"); }}
                  onMouseLeave={(e) => { if (formState === "idle") (e.currentTarget.style.background = "#E8A020"); }}
                >
                  {formState === "submitting" ? "SENDING..." : formState === "error" ? "FAILED — TRY AGAIN" : "CLAIM YOUR TERRITORY →"}
                </button>
                <p style={{ textAlign: "center", fontSize: 11, color: "#8C8070" }}>
                  No credit card. No commitment. We review every submission personally.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
