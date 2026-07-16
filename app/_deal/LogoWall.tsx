"use client";

import { C } from "./theme";
import { wrap, Reveal } from "./ui";

/* Logo wall.
   Real artwork goes in `src`. Where there is no artwork yet, the
   name is set in type as a stand-in wordmark, each in a face
   distinct from the site's own so the row does not read as three
   headings. Replace these with real files as they arrive. */

type Logo = {
  name: string;
  src?: string;
  font?: string;
  weight?: number;
  size?: number;
  tracking?: string;
  transform?: "uppercase" | "none";
};

const LOGOS: Logo[] = [
  { name: "Search Fund Ventures", src: "/logo-sfv.png" },
  {
    name: "Ramberg Partners",
    font: "'Playfair Display', Georgia, serif",
    weight: 500,
    size: 19,
    tracking: "0.06em",
    transform: "uppercase",
  },
  {
    name: "Firepit Wellness",
    font: "'Manrope Variable', sans-serif",
    weight: 800,
    size: 19,
    tracking: "-0.05em",
    transform: "none",
  },
];

export default function LogoWall() {
  return (
    <section style={{ background: C.bg, borderBlock: `1px solid ${C.border}`, padding: "44px 0" }}>
      <div style={wrap}>
        <Reveal>
          <div
            style={{
              fontFamily: C.mono,
              fontSize: 10,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: C.muted,
              textAlign: "center",
              marginBottom: 30,
            }}
          >
            Trusted by leading firms
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 72,
              flexWrap: "wrap",
            }}
          >
            {LOGOS.map((l) =>
              l.src ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={l.name}
                  src={l.src}
                  alt={l.name}
                  style={{
                    height: 38,
                    width: "auto",
                    objectFit: "contain",
                    filter: "grayscale(1)",
                    opacity: 0.55,
                  }}
                />
              ) : (
                <div
                  key={l.name}
                  style={{
                    fontFamily: l.font,
                    fontWeight: l.weight,
                    fontSize: l.size,
                    letterSpacing: l.tracking,
                    textTransform: l.transform,
                    color: C.ink,
                    opacity: 0.5,
                    whiteSpace: "nowrap",
                  }}
                >
                  {l.name}
                </div>
              )
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
