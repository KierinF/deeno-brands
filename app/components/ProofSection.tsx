export default function ProofSection() {
  return (
    <section style={{ background: "#F7F4EE", borderBottom: "1px solid #C8C1B3", padding: "80px 40px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "80px",
          alignItems: "start",
        }}>
          {/* Left: scarcity / first-mover */}
          <div>
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: "#E8A020",
              letterSpacing: "3px",
              textTransform: "uppercase",
              marginBottom: 24,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}>
              <span style={{ display: "block", width: 32, height: 1, background: "#E8A020" }} />
              Results
            </div>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(38px, 5vw, 64px)",
              letterSpacing: "2px",
              color: "#1C2B2B",
              lineHeight: 0.95,
              marginBottom: 40,
            }}>
              The operators who move first,<br />
              <span style={{ color: "#E8A020" }}>own the market.</span>
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 20, fontSize: 16, lineHeight: 1.75 }}>
              <p style={{ color: "#8C8070" }}>We take one client per trade per territory.</p>
              <p style={{ color: "#8C8070" }}>
                The campaigns running now are locking up markets that won&apos;t be available next month.
              </p>
              <p style={{ color: "#8C8070" }}>
                When your territory closes, the operator who claimed it has a pipeline partner their competitors don&apos;t.
              </p>
              <p style={{ color: "#1C2B2B", fontWeight: 600, fontSize: 17 }}>
                That&apos;s not a consolation prize for moving early. It&apos;s the whole model.
              </p>
            </div>
            <p style={{
              marginTop: 40,
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: "#8C8070",
              lineHeight: 1.7,
            }}>
              Results from active campaigns are published as they&apos;re confirmed.{" "}
              <a href="#contact" style={{ color: "#E8A020", textDecoration: "none" }}>Ask us on the audit call</a>
              {" "}what current campaigns are producing.
            </p>
          </div>

          {/* Right: case study */}
          <div style={{
            border: "1px solid #C8C1B3",
            background: "#EEE9DF",
          }}>
            {/* Header bar */}
            <div style={{
              padding: "20px 28px",
              borderBottom: "1px solid #C8C1B3",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <div>
                <div style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 9,
                  color: "#8C8070",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}>
                  The Hamptons, NY · Tree Care
                </div>
                <div style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 22,
                  color: "#1C2B2B",
                  letterSpacing: "1.5px",
                }}>
                  Hamptons Tree &amp; Shrub Care
                </div>
              </div>
              <div style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 9,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: "#E8A020",
                border: "1px solid rgba(232,160,32,0.3)",
                padding: "4px 10px",
                background: "rgba(232,160,32,0.06)",
                whiteSpace: "nowrap",
              }}>
                Campaign Active
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: "28px" }}>
              <p style={{ fontSize: 14, color: "#8C8070", lineHeight: 1.7, marginBottom: 24 }}>
                Boutique tree care and shrub management serving estate and commercial properties across the Hamptons. Strong local reputation, limited commercial pipeline.
              </p>
              <p style={{ fontSize: 14, color: "#8C8070", lineHeight: 1.7, marginBottom: 28 }}>
                We built their commercial ICP targeting HOA property managers, estate managers, and commercial facility directors across Southampton, East Hampton, and Bridgehampton. Cold email, LinkedIn, and direct mail running simultaneously.
              </p>

              {/* Channels */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 28 }}>
                {["Cold email", "LinkedIn", "Direct mail", "Cold calling"].map((ch) => (
                  <span key={ch} style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 9,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    color: "#E8A020",
                    border: "1px solid rgba(232,160,32,0.25)",
                    padding: "3px 8px",
                    background: "rgba(232,160,32,0.06)",
                  }}>
                    {ch}
                  </span>
                ))}
              </div>

              {/* Stats */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 1,
                background: "#C8C1B3",
                border: "1px solid #C8C1B3",
              }}>
                {[
                  { label: "Campaign launched", value: "March 2025" },
                  { label: "Territory", value: "Exclusive" },
                  { label: "Target buyers", value: "HOAs + Estates" },
                  { label: "Results", value: "Reporting soon" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "#F7F4EE", padding: "16px 18px" }}>
                    <div style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 9,
                      color: "#8C8070",
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      marginBottom: 4,
                    }}>
                      {s.label}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1C2B2B" }}>
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
