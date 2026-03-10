"use client";

export default function Footer() {
  return (
    <footer
      style={{
        background: "#0A0A0A",
        borderTop: "1px solid #2A2A2A",
        padding: "40px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: 22,
              letterSpacing: "3px",
              color: "#E8FF47",
            }}
          >
            DEENO
            <span style={{ color: "#F5F5F2", opacity: 0.4, marginLeft: 6 }}>BRANDS</span>
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
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
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
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.5px",
              color: "#2A2A2A",
            }}
          >
            © 2025 Deeno Brands LLC
          </span>
        </div>
      </div>
    </footer>
  );
}
