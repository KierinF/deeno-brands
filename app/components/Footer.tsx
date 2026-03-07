"use client";

import { useState } from "react";

export default function Footer() {
  const [hovered, setHovered] = useState(false);

  return (
    <footer
      style={{
        background: "#EDEAE0",
        borderTop: "1px solid rgba(28,25,23,0.1)",
        padding: "24px 0",
      }}
    >
      <div
        className="max-w-6xl mx-auto px-6"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <p
          style={{
            fontFamily: '"SF Mono","Fira Code","Fira Mono",monospace',
            fontSize: 9,
            letterSpacing: "0.12em",
            color: "rgba(28,25,23,0.25)",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          © 2025 Deeno Brands LLC&nbsp;&nbsp;·&nbsp;&nbsp;Home Services Marketing
        </p>

        <a
          href="mailto:kierin@deenobrands.agency"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            fontFamily: '"SF Mono","Fira Code","Fira Mono",monospace',
            fontSize: 11,
            letterSpacing: "0.05em",
            color: hovered ? "#1C1917" : "rgba(28,25,23,0.35)",
            textDecoration: "none",
            transition: "color 0.2s ease",
          }}
        >
          kierin@deenobrands.agency
        </a>
      </div>
    </footer>
  );
}
