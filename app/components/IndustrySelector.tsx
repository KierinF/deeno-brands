"use client";

const verticals = [
  { title: "HVAC", bg: "#1C2B2B" },
  { title: "Fire Protection", bg: "#3A1F1F" },
  { title: "Janitorial / Cleaning", bg: "#1A2535" },
  { title: "Medical Gas Inspection & Testing", bg: "#1A3020" },
  { title: "Hazardous Waste Removal", bg: "#2A2318" },
  { title: "Cooling Tower Water Treatment", bg: "#15303A" },
  { title: "Other", bg: "#252520", span: 2 },
];

export default function IndustrySelector() {
  return (
    <section
      id="industries"
      className="rsp-industry-section"
      style={{
        minHeight: "90vh",
        display: "flex",
        flexDirection: "column",
        background: "#1C2B2B",
        overflow: "hidden",
      }}
    >
      {/* Section header */}
      <div style={{ padding: "40px 40px 20px" }}>
        <h2
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(52px, 8vw, 110px)",
            color: "#FFFFFF",
            letterSpacing: "3px",
            lineHeight: 1,
            marginBottom: 8,
          }}
        >
          YOUR INDUSTRY.
        </h2>
        <p
          style={{
            color: "rgba(255,255,255,0.50)",
            fontSize: 12,
            fontFamily: "'DM Mono', monospace",
            letterSpacing: "2.5px",
            textTransform: "uppercase",
          }}
        >
          One client. One market. First to claim it closes the territory.
        </p>
      </div>

      {/* Grid: 4 cols top row (4 tiles), bottom row 4 cols with last tile spanning 2 */}
      <div
        className="rsp-industry-cards"
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridAutoRows: "minmax(160px, 1fr)",
          gap: 6,
          padding: "0 6px 6px",
        }}
      >
        {verticals.map((v, i) => (
          <div
            key={i}
            className="rsp-industry-card"
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 10,
              background: v.bg,
              minHeight: 160,
              gridColumn: v.span ? `span ${v.span}` : undefined,
            }}
          >
            {/* Dark gradient overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.88) 100%)",
              }}
            />

            {/* Industry name */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "16px 18px",
              }}
            >
              <h3
                style={{
                  fontFamily: "'DM Sans Variable', 'DM Sans', sans-serif",
                  fontWeight: 700,
                  fontSize: "clamp(14px, 1.4vw, 20px)",
                  color: "#FFFFFF",
                  lineHeight: 1.25,
                  textShadow: "0 1px 8px rgba(0,0,0,0.6)",
                }}
              >
                {v.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
