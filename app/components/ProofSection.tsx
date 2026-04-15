export default function ProofSection() {
  return (
    <section id="proof" style={{ background: "#F7F4EE", borderBottom: "1px solid #C8C1B3", padding: "80px 40px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "80px",
          alignItems: "start",
        }}>
          {/* Left: headline + narrative */}
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
              What the system<br />
              <span style={{ color: "#E8A020" }}>actually produces.</span>
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 20, fontSize: 16, lineHeight: 1.75 }}>
              <p style={{ color: "#1C2B2B", fontWeight: 600, fontSize: 17 }}>
                One client per trade per market is not a sales tactic. It is the model.
              </p>
              <p style={{ color: "#8C8070" }}>
                We cannot build a growth engine for two competing plumbers in the same city. When a territory closes it closes. The operator who claims it first gets something their competitors cannot buy later — a fully running system locked to their market.
              </p>
              <p style={{ color: "#8C8070" }}>
                These are the results that system is producing.
              </p>
            </div>
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
                  Private Equity · Essential Business Acquisitions · National
                </div>
                <div style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 22,
                  color: "#1C2B2B",
                  letterSpacing: "1.5px",
                }}>
                  Search Fund Ventures
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
                Ongoing
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: "28px" }}>
              <p style={{ fontSize: 14, color: "#8C8070", lineHeight: 1.7, marginBottom: 16 }}>
                Search Fund Ventures acquires essential service businesses across the United States. They needed a consistent pipeline of qualified acquisition targets — owner operators open to a conversation about selling.
              </p>
              <p style={{ fontSize: 14, color: "#8C8070", lineHeight: 1.7, marginBottom: 16 }}>
                We built their outbound system from scratch. ICP defined around owner operated essential businesses at the right revenue threshold. Sequences written for business owners, not buyers. Every reply handled by us.
              </p>
              <p style={{ fontSize: 14, color: "#1C2B2B", fontWeight: 600, lineHeight: 1.7, marginBottom: 16 }}>
                In ninety days: 45 qualified meetings with business owners. 14 active acquisitions currently in progress.
              </p>
              <p style={{ fontSize: 14, color: "#8C8070", lineHeight: 1.7, marginBottom: 28 }}>
                After three months the system was working. They chose to keep building.
              </p>

              {/* Stats */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 1,
                background: "#C8C1B3",
                border: "1px solid #C8C1B3",
              }}>
                {[
                  { label: "Campaign launched", value: "December 2025" },
                  { label: "Target", value: "Owner operated essentials" },
                  { label: "Meetings in 90 days", value: "45" },
                  { label: "Active acquisitions", value: "14" },
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
