"use client";

const industries = [
  "HVAC",
  "Fire Protection",
  "Janitorial/Cleaning",
  "Medical Gas Inspection & Testing",
  "Hazardous Waste Removal",
  "Cooling Tower Water Treatment",
];

export default function Footer() {
  return (
    <footer
      style={{
        background: "#1C2B2B",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "48px 40px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 40,
          flexWrap: "wrap",
        }}
      >
        {/* Left: branding + contact */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <span
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 22,
              letterSpacing: "3px",
              color: "#E8A020",
            }}
          >
            DEENO
          </span>
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              letterSpacing: "1.5px",
              color: "rgba(255,255,255,0.35)",
              textTransform: "uppercase",
              maxWidth: 380,
              lineHeight: 1.6,
            }}
          >
            The Growth Engine for Businesses that Keep America Running.
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            <a
              href="mailto:kierin@deenobrands.agency"
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 12,
                letterSpacing: "0.5px",
                color: "rgba(255,255,255,0.35)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#F7F4EE")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.35)")}
            >
              kierin@deenobrands.agency
            </a>
            <a
              href="tel:+16315214302"
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 12,
                letterSpacing: "0.5px",
                color: "rgba(255,255,255,0.35)",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#F7F4EE")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.35)")}
            >
              (631) 521-4302
            </a>
          </div>
        </div>

        {/* Right: industries + copyright */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 9,
              letterSpacing: "2px",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.25)",
              marginBottom: 4,
            }}
          >
            Industries
          </span>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "6px 0",
            }}
          >
            {industries.map((ind, i) => (
              <span key={ind}>
                <span
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 11,
                    letterSpacing: "0.5px",
                    color: "rgba(255,255,255,0.3)",
                  }}
                >
                  {ind}
                </span>
                {i < industries.length - 1 && (
                  <span style={{ color: "rgba(255,255,255,0.12)", margin: "0 8px" }}>·</span>
                )}
              </span>
            ))}
          </div>
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.5px",
              color: "rgba(255,255,255,0.15)",
              marginTop: "auto",
              paddingTop: 24,
            }}
          >
            © 2025 Deeno Brands LLC
          </span>
        </div>
      </div>
    </footer>
  );
}
