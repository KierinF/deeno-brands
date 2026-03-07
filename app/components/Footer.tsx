"use client";

function DinoMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="white" aria-hidden="true">
      <path d="M 0 0 C -1.2 -1.5 -1.2 -7.5 0 -11 C 1.2 -7.5 1.2 -1.5 0 0 Z"
        transform="translate(12,16)" />
      <path d="M 0 0 C -1.2 -1.5 -1.2 -7.5 0 -11 C 1.2 -7.5 1.2 -1.5 0 0 Z"
        transform="translate(12,16) rotate(-36)" />
      <path d="M 0 0 C -1.2 -1.5 -1.2 -7.5 0 -11 C 1.2 -7.5 1.2 -1.5 0 0 Z"
        transform="translate(12,16) rotate(36)" />
      <ellipse cx="12" cy="21" rx="2.2" ry="1.6" />
    </svg>
  );
}

const footerLinks = {
  Services: ["SEO & Local SEO", "Google & Meta Ads", "Website Design", "Social Media"],
  Company: ["About", "Contact"],
  Trades: ["HVAC", "Plumbing", "Roofing", "Electrical", "Landscaping"],
  Legal: ["Privacy Policy", "Terms of Service"],
};

export default function Footer() {
  return (
    <footer style={{ background: "#0E0B07", borderTop: "1px solid rgba(201,168,76,0.1)" }}>
      {/* Top strip */}
      <div style={{ borderBottom: "1px solid rgba(201,168,76,0.08)" }}>
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "#8B5CF6" }}
            >
              <DinoMark size={16} />
            </div>
            <span
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 17,
                color: "#F2E8D5",
              }}
            >
              Deeno<span style={{ color: "#8B5CF6" }}>.</span>
            </span>
          </div>
          <a
            href="mailto:kierin@deenobrands.agency"
            className="text-sm transition-colors"
            style={{ color: "rgba(242,232,213,0.25)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#F2E8D5")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(242,232,213,0.25)")}
          >
            kierin@deenobrands.agency
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          {/* Brand col */}
          <div className="col-span-2 md:col-span-1">
            <p
              className="text-sm leading-relaxed mb-6 max-w-[180px]"
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontStyle: "italic",
                color: "rgba(242,232,213,0.2)",
              }}
            >
              Helping home services survive the extinction.
            </p>
            <div
              style={{
                fontFamily: '"SF Mono","Fira Code",monospace',
                fontSize: 8,
                letterSpacing: "0.15em",
                color: "rgba(201,168,76,0.25)",
                textTransform: "uppercase",
              }}
            >
              EST. 2025 // HOME SERVICES
            </div>
          </div>

          {/* Link groups */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4
                className="mb-4"
                style={{
                  fontFamily: '"SF Mono","Fira Code",monospace',
                  fontSize: 9,
                  letterSpacing: "0.18em",
                  color: "rgba(201,168,76,0.4)",
                  textTransform: "uppercase",
                }}
              >
                {group}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm transition-colors"
                      style={{ color: "rgba(242,232,213,0.22)" }}
                      onMouseEnter={e => (e.currentTarget.style.color = "rgba(242,232,213,0.6)")}
                      onMouseLeave={e => (e.currentTarget.style.color = "rgba(242,232,213,0.22)")}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid rgba(201,168,76,0.08)" }}
        >
          <p
            className="text-xs"
            style={{
              fontFamily: '"SF Mono","Fira Code",monospace',
              color: "rgba(242,232,213,0.12)",
              letterSpacing: "0.06em",
            }}
          >
            © 2025 DEENO BRANDS LLC. ALL RIGHTS RESERVED.
          </p>
          <p
            className="text-xs"
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: "italic",
              color: "rgba(242,232,213,0.1)",
            }}
          >
            Helping home services survive the extinction.
          </p>
        </div>
      </div>
    </footer>
  );
}
