"use client";

import { useState } from "react";
import { createClient } from "../lib/supabase";

export default function ClientLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = "/dashboard";
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#F7F4EE",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
      }}
    >
      <a href="/" style={{ textDecoration: "none", marginBottom: 48 }}>
        <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32, letterSpacing: "4px", color: "#E8A020" }}>
          DEENO
        </span>
      </a>

      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#F7F4EE",
          border: "1px solid #C8C1B3",
          borderTop: "3px solid #E8A020",
          padding: "40px",
        }}
      >
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, letterSpacing: "3px", color: "#E8A020", textTransform: "uppercase", marginBottom: 8 }}>
          Client Portal
        </div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, letterSpacing: "2px", color: "#1C2B2B", lineHeight: 1, marginBottom: 32 }}>
          VIEW YOUR RESULTS
        </h1>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "1.5px", color: "#8C8070", textTransform: "uppercase" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@company.com"
              style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, padding: "12px 14px", background: "#EEE9DF", border: "1px solid #C8C1B3", color: "#1C2B2B", outline: "none", width: "100%", boxSizing: "border-box" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#E8A020")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#C8C1B3")}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "1.5px", color: "#8C8070", textTransform: "uppercase" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, padding: "12px 14px", background: "#EEE9DF", border: "1px solid #C8C1B3", color: "#1C2B2B", outline: "none", width: "100%", boxSizing: "border-box" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#E8A020")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#C8C1B3")}
            />
          </div>

          {error && (
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#C0392B", lineHeight: 1.6, padding: "10px 14px", background: "#FDF0EE", border: "1px solid #E8C0B8" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ fontFamily: "'DM Mono', monospace", fontSize: 12, letterSpacing: "1.5px", padding: "14px 28px", background: loading ? "#C8C1B3" : "#E8A020", color: "#F7F4EE", border: "none", cursor: loading ? "not-allowed" : "pointer", fontWeight: 500, transition: "background 0.2s", marginTop: 8 }}
            onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#F0AA30"; }}
            onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#E8A020"; }}
          >
            {loading ? "SIGNING IN..." : "SIGN IN →"}
          </button>
        </form>
      </div>

      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: "#8C8070", marginTop: 24, letterSpacing: "0.5px" }}>
        Not a client?{" "}
        <a href="/#contact" style={{ color: "#E8A020", textDecoration: "none" }}>Book a free audit →</a>
      </p>
    </main>
  );
}
