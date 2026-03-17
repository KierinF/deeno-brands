export default function FounderSection() {
  return (
    <section
      style={{
        background: "#F7F4EE",
        padding: "100px 40px",
        borderBottom: "1px solid #C8C1B3",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <div
          className="rsp-founder-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "80px",
            alignItems: "start",
          }}
        >
          {/* Left: eyebrow + headline + copy */}
          <div>
            <div style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 11,
              color: "#E8A020",
              letterSpacing: "3px",
              textTransform: "uppercase",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}>
              <span style={{ display: "block", width: 32, height: 1, background: "#E8A020" }} />
              From the founder
            </div>
            <h2 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: "clamp(32px, 4.5vw, 58px)",
              letterSpacing: "1.5px",
              color: "#1C2B2B",
              lineHeight: 0.95,
              marginBottom: 40,
            }}>
              I built this because I watched my dad fight for the same accounts
              <span style={{ color: "#E8A020" }}> you&apos;re fighting for.</span>
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 20, color: "#8C8070", fontSize: 16, lineHeight: 1.85 }}>
              <p>I grew up on job sites. My dad owned a construction company.</p>
              <p>
                I watched him run an excellent operation and fight for every commercial account. He was better than the guys getting the contracts. He just couldn&apos;t get in the room.
              </p>
              <p>
                I got into tech and spent years learning how the best companies in the world find their buyers. The tools exist. The playbooks exist.
              </p>
              <p style={{ color: "#1C2B2B", fontWeight: 600, fontSize: 17, marginTop: 8 }}>
                Nobody had brought them to trades.
              </p>
              <p style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(32px, 4vw, 52px)",
                color: "#E8A020",
                letterSpacing: "2px",
                lineHeight: 1,
                marginTop: 4,
                marginBottom: 8,
              }}>
                So I did.
              </p>
              <p style={{ color: "#8C8070", marginTop: 8 }}>
                Deeno is for the operator my dad was — the one who does excellent work and just needs someone to get him in the room.
              </p>
              <div style={{ marginTop: 12, paddingTop: 20, borderTop: "1px solid #C8C1B3" }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#8C8070", letterSpacing: "1px" }}>
                  — Kierin
                </div>
              </div>
            </div>
          </div>

          {/* Right: photo */}
          <div style={{ position: "sticky", top: 40 }}>
            <div style={{
              width: "100%",
              aspectRatio: "3 / 4",
              overflow: "hidden",
              border: "1px solid #C8C1B3",
            }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/kierin.png"
                alt="Kierin, Founder of Deeno Brands"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "20% top",
                  display: "block",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
