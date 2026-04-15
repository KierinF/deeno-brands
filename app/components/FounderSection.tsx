export default function FounderSection() {
  return (
    <section
      id="about"
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
              I grew up on job sites.<br />
              <span style={{ color: "#E8A020" }}>My dad owned a construction company.</span>
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 20, color: "#8C8070", fontSize: 16, lineHeight: 1.85 }}>
              <p>
                I watched him run an excellent operation and lose accounts to guys who were worse at the work. Not because he wasn&apos;t good enough. Because he was too busy being the business to build anything around it. He was on the tools, handling whatever came up that day. And somewhere in all of that the growth just never got done.
              </p>
              <p style={{ color: "#1C2B2B", fontWeight: 600, fontSize: 17 }}>
                He was better than the guys getting the contracts. He just couldn&apos;t get in the room.
              </p>
              <p>
                I spent half a decade taking some of the fastest growing software companies in the country from six figures to eight by building revenue systems. Building the infrastructure that takes a company from guessing to growing predictably. One that runs whether the founder is selling or not.
              </p>
              <p>
                At some point I realized I&apos;d spent years building that for companies that already had every advantage. And my dad never had any of it.
              </p>
              <p style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "clamp(28px, 3.4vw, 44px)",
                color: "#E8A020",
                letterSpacing: "2px",
                lineHeight: 1,
                marginTop: 8,
                marginBottom: 8,
              }}>
                So I came back. That&apos;s what Deeno&apos;s for.
              </p>
              <div style={{ marginTop: 12, paddingTop: 20, borderTop: "1px solid #C8C1B3" }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#8C8070", letterSpacing: "1px" }}>
                  — Kierin, Founder of Deeno
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
