"use client";

const industries = [
  "Commercial HVAC",
  "Commercial Electrical",
  "Commercial Plumbing",
  "Commercial Landscaping",
  "Commercial Pest Control",
];

export default function Footer() {
  return (
    <footer
      style={{
        background: "#0A0A0A",
        borderTop: "1px solid #2A2A2A",
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
              color: "#E8FF47",
            }}
          >
            DEENO
          </span>
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              letterSpacing: "1.5px",
              color: "#333",
              textTransform: "uppercase",
            }}
          >
            Commercial Pipeline for Trades
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            <a
              href="mailto:kierin@deenobrands.agency"
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 12,
                letterSpacing: "0.5px",
                color: "#444",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#F5F5F2")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#444")}
            >
              kierin@deenobrands.agency
            </a>
            <a
              href="tel:+16315214302"
              style={{
                fontFamily: "'DM Mono', monospace",
                fontSize: 12,
                letterSpacing: "0.5px",
                color: "#444",
                textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#F5F5F2")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#444")}
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
              color: "#333",
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
                <a
                  href="#industries"
                  style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 11,
                    letterSpacing: "0.5px",
                    color: "#444",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#F5F5F2")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#444")}
                >
                  {ind}
                </a>
                {i < industries.length - 1 && (
                  <span style={{ color: "#2A2A2A", margin: "0 8px" }}>·</span>
                )}
              </span>
            ))}
          </div>
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.5px",
              color: "#2A2A2A",
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
