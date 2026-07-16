"use client";

import { useState } from "react";
import { motion, useScroll, useSpring, AnimatePresence } from "framer-motion";
import { C, F } from "./_deal/theme";
import { wrap, H2, Lede, CTA, Reveal } from "./_deal/ui";
import Checklist from "./_deal/Checklist";
import Calculator from "./_deal/Calculator";
import Timeline from "./_deal/Timeline";
import Compare from "./_deal/Compare";
import Channels from "./_deal/Channels";
import Messages from "./_deal/Messages";
import LogoWall from "./_deal/LogoWall";

/* ============================================================
   V2 — DEAL ORIGINATION PAGE
   Clinical palette, Archivo.

   No proof section by design: it returns when there is a real
   deal to name. Fabricated case studies are worse than none in a
   market where the buyers all know each other.
   ============================================================ */

function Progress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      style={{
        scaleX,
        transformOrigin: "left",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 2,
        background: C.accent,
        zIndex: 60,
      }}
    />
  );
}

/* Section anchors. Each target sets scrollMarginTop so the sticky
   nav does not sit on top of the heading it just jumped to. */
const NAV_LINKS: [string, string][] = [
  ["Who We Serve", "#who"],
  ["The Contract", "#contract"],
  ["The Math", "#math"],
];

/* ---------- NAV ---------- */
function Nav() {
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(252,252,251,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <div style={{ ...wrap, height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontFamily: F.stack, fontSize: 20, fontWeight: F.weight, letterSpacing: "-0.02em", color: C.ink }}>
          DEENO
        </span>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {NAV_LINKS.map(([label, href]) => (
            <a
              key={href}
              href={href}
              style={{ fontFamily: C.mono, fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: C.mid, textDecoration: "none" }}
            >
              {label}
            </a>
          ))}
          <CTA small />
        </div>
      </div>
    </nav>
  );
}

/* ---------- HERO ---------- */
function Hero() {
  const cells: [string, string][] = [
    ["$0", "Retainer"],
    ["$0", "Setup fee"],
    ["$0", "If they no-show"],
  ];
  return (
    <section style={{ ...wrap, padding: "96px 40px 92px" }}>
      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontFamily: F.stack,
          fontSize: "clamp(38px, 4.4vw, 61px)",
          fontWeight: F.weight,
          letterSpacing: F.tracking,
          lineHeight: 1.06,
          color: C.ink,
          margin: "0 0 24px",
          maxWidth: 940,
        }}
      >
        You don&apos;t pay us until a meeting
        <br />
        actually happens.
      </motion.h1>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.14 }}>
        <Lede max={600}>
          Business owners looking to sell $2M to $20M businesses. Priced per
          meeting that shows up and clears all six criteria.
        </Lede>
      </motion.div>

      {/* Full width, three equal columns divided by rules. The zeros
          are the argument, so they get the room. */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.22 }}
        style={{
          border: `1px solid ${C.border}`,
          background: C.panel,
          margin: "40px 0",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
          {cells.map(([v, l], i) => (
            <div
              key={l}
              style={{
                padding: "30px 28px",
                borderLeft: i === 0 ? "none" : `1px solid ${C.border}`,
              }}
            >
              <div
                style={{
                  fontFamily: F.stack,
                  fontSize: "clamp(38px, 4vw, 52px)",
                  fontWeight: F.weight,
                  letterSpacing: F.tracking,
                  color: C.ink,
                  lineHeight: 1,
                }}
              >
                {v}
              </div>
              <div style={{ fontSize: 14, color: C.mid, marginTop: 10 }}>{l}</div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <CTA />
      </motion.div>
    </section>
  );
}

/* ---------- WHO WE SERVE ---------- */
function WhoWeServe() {
  const cards: [string, string][] = [
    ["PE Firms", "Proprietary deal flow that never touches an auction process."],
    ["M&A Advisors", "Sell-side mandates from owners who are not yet represented."],
    ["Business Brokers", "Signed listings from owners already open to a transaction."],
    ["Search Funds", "The one business you actually buy, before the search capital runs out."],
  ];
  return (
    <section id="who" style={{ background: C.bgAlt, borderBlock: `1px solid ${C.border}`, padding: "96px 0", scrollMarginTop: 68 }}>
      <div style={wrap}>
        <Reveal>
          <H2>Who we serve.</H2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 44 }}>
          {cards.map(([n, d], i) => (
            <Reveal key={n} delay={i * 0.06}>
              <motion.div
                whileHover={{ y: -3 }}
                transition={{ duration: 0.2 }}
                style={{ background: C.panel, border: `1px solid ${C.border}`, padding: 24, height: "100%" }}
              >
                <h3 style={{ fontFamily: F.stack, fontSize: 20, fontWeight: F.weight, letterSpacing: F.tracking, color: C.ink, margin: "0 0 10px" }}>
                  {n}
                </h3>
                <p style={{ color: C.mid, lineHeight: 1.6, margin: 0, fontSize: 14.5 }}>{d}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- CONFIDENTIALITY ---------- */
function Confidentiality() {
  const lines: [string, string][] = [
    ["You sign off on everything", "Every email, every LinkedIn touch, every call script. Nothing is improvised on your behalf."],
    ["Our infrastructure, not yours", "Domains we register for the campaign, profiles we operate, our own numbers. Your primary domain is never in the sending path."],
    ["No spray", "Discreet, industry-native approaches. Never a blast asking two thousand owners whether they are selling."],
  ];
  return (
    <section style={{ background: C.bgAlt, borderBlock: `1px solid ${C.border}`, padding: "96px 0" }}>
      <div style={wrap}>
        <Reveal>
          <H2 max={880}>We do not send out a single message until it has been approved.</H2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, marginTop: 40, background: C.border, border: `1px solid ${C.border}` }}>
          {lines.map(([t, d], i) => (
            <Reveal key={t} delay={i * 0.05}>
              <div style={{ background: C.panel, padding: 28, height: "100%" }}>
                <div style={{ fontFamily: F.stack, fontSize: 16, fontWeight: F.weight, letterSpacing: F.tracking, color: C.ink, marginBottom: 6 }}>
                  {t}
                </div>
                <div style={{ color: C.mid, fontSize: 15, lineHeight: 1.6 }}>{d}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- WHAT WE ARE NOT ---------- */
function WhatWereNot() {
  const lines = [
    "We do not sell you a list.",
    "We do not send you replies to sort.",
    "We do not invoice you for a month where nothing happened.",
  ];
  return (
    <section style={{ ...wrap, padding: "104px 40px" }}>
      <div style={{ maxWidth: 820 }}>
        {lines.map((l, i) => (
          <Reveal key={l} delay={i * 0.07}>
            <p
              style={{
                fontFamily: F.stack,
                fontSize: "clamp(24px, 2.8vw, 37px)",
                fontWeight: F.weight,
                letterSpacing: F.tracking,
                lineHeight: 1.25,
                color: C.ink,
                margin: "0 0 16px",
              }}
            >
              {l}
            </p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
const FAQS: [string, string][] = [
  [
    "Where do the owners come from?",
    "We build the list against your thesis from public filings, licensing records, industry associations, and direct research. Nothing is bought from a list broker, and you see the list before anything goes out.",
  ],
  [
    "How do you actually reach them?",
    "Email, LinkedIn, and the phone, in whatever mix the owner responds to. We cannot know in advance which one that is, which is why we run all three rather than betting on one.",
  ],
  [
    "What if the meeting is a dud?",
    "Flag it within 48 hours and we void the invoice and replace the meeting. That is what the six criteria are for: they are the contract, not a marketing promise.",
  ],
  [
    "Whose name is on the outreach?",
    "Ours, on infrastructure we own, unless you tell us otherwise. Domains we register for the campaign, profiles we operate, our own numbers, and nothing sends until you have read it.",
  ],
  [
    "If you can find these owners, why not buy the businesses yourselves?",
    "Because sourcing a conversation and closing a transaction are different jobs, and we are only good at the first one. We have no capital, no thesis of our own, and no interest in competing with the people who pay us.",
  ],
  [
    "How many meetings should we expect?",
    "It depends entirely on how wide your thesis is. A national roll-up in a fragmented trade has thousands of targets; one industry in one metro at a narrow EBITDA band might have forty, and we would rather tell you that on the first call than discover it in month three.",
  ],
  [
    "Can you work around our conflicts?",
    "Yes. We take one client per industry per region so we are never running a competing mandate, and you give us an exclusion list at intake covering anyone you are already engaged with.",
  ],
  [
    "What does it cost?",
    "It depends on your thesis. An owner in a $20M band is worth more than one in a $2M band, and a narrow industry costs more to source than a broad one, so we quote per qualified meeting once we know what you are hunting.",
  ],
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section style={{ background: C.bgAlt, borderBlock: `1px solid ${C.border}`, padding: "96px 0" }}>
      <div style={{ ...wrap, maxWidth: 820 }}>
        <div style={{ marginTop: 24 }}>
          {FAQS.map(([q, a], i) => (
            <div key={q} style={{ borderTop: `1px solid ${C.border}` }}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  padding: "24px 0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: F.stack,
                  fontSize: 19,
                  fontWeight: F.weight,
                  letterSpacing: F.tracking,
                  color: C.ink,
                  gap: 24,
                }}
              >
                {q}
                <motion.span animate={{ rotate: open === i ? 45 : 0 }} transition={{ duration: 0.2 }} style={{ color: C.accent, fontSize: 22, lineHeight: 1 }}>
                  +
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    style={{ overflow: "hidden" }}
                  >
                    <p style={{ color: C.mid, lineHeight: 1.7, margin: "0 0 24px", paddingRight: 60, fontSize: 16 }}>
                      {a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- CLOSE ----------
   Two steps. The qualifier gates the calendar: answer three
   questions, then book. The answers ride into Calendly as prefills
   (a1/a2/a3 map to your event's custom questions, in order), so the
   booking arrives with the thesis attached instead of blank.

   The a1/a2/a3 prefills land only if the event has three custom
   questions defined in this order: industry, geography, band. */
const CALENDLY_URL = "https://calendly.com/kierin-proprietaries/30min";

const FIELDS: [keyof Thesis, string, string][] = [
  ["industry", "Industry", "e.g. HVAC, waste, specialty contracting"],
  ["geography", "Geography", "e.g. Southeast, Texas, national"],
  ["band", "EBITDA band", "e.g. $1M to $5M"],
];

type Thesis = { industry: string; geography: string; band: string };

function Close() {
  const [thesis, setThesis] = useState<Thesis>({ industry: "", geography: "", band: "" });
  const [booking, setBooking] = useState(false);
  const ready = FIELDS.every(([k]) => thesis[k].trim().length > 0);

  const calendarSrc =
    `${CALENDLY_URL}?hide_gdpr_banner=1&background_color=FFFFFF&text_color=0D1211&primary_color=14503C` +
    `&a1=${encodeURIComponent(thesis.industry)}` +
    `&a2=${encodeURIComponent(thesis.geography)}` +
    `&a3=${encodeURIComponent(thesis.band)}`;

  return (
    <section id="check" style={{ ...wrap, padding: "112px 40px", scrollMarginTop: 68 }}>
      <Reveal>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <h2
            style={{
              fontFamily: F.stack,
              fontSize: "clamp(30px, 3.6vw, 50px)",
              fontWeight: F.weight,
              letterSpacing: F.tracking,
              lineHeight: 1.08,
              color: C.ink,
              margin: "0 0 14px",
            }}
          >
            {booking ? "Pick a time." : "Tell us your thesis."}
          </h2>
          <Lede max={520} center>
            {booking
              ? "Twenty minutes. We will tell you whether we can source it, whether your vertical is open, and what a qualified meeting costs."
              : "If we can source it and your vertical is open, we will tell you what a qualified meeting costs."}
          </Lede>
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <AnimatePresence mode="wait">
          {!booking ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              style={{ maxWidth: 640, margin: "0 auto", border: `1px solid ${C.border}`, background: C.panel, padding: 36 }}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (ready) setBooking(true);
                }}
              >
                {FIELDS.map(([key, label, ph]) => (
                  <div key={key} style={{ marginBottom: 22 }}>
                    <label
                      htmlFor={key}
                      style={{
                        display: "block",
                        fontFamily: C.mono,
                        fontSize: 10,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: C.mid,
                        marginBottom: 8,
                      }}
                    >
                      {label}
                    </label>
                    <input
                      id={key}
                      value={thesis[key]}
                      onChange={(e) => setThesis((p) => ({ ...p, [key]: e.target.value }))}
                      placeholder={ph}
                      style={{
                        width: "100%",
                        padding: "13px 14px",
                        border: `1px solid ${C.border}`,
                        background: C.bg,
                        color: C.ink,
                        fontFamily: "inherit",
                        fontSize: 15,
                        outline: "none",
                      }}
                    />
                  </div>
                ))}
                <motion.button
                  type="submit"
                  disabled={!ready}
                  whileHover={ready ? { y: -2 } : undefined}
                  whileTap={ready ? { y: 0 } : undefined}
                  style={{
                    width: "100%",
                    padding: "17px",
                    background: ready ? C.accent : C.bgAlt,
                    color: ready ? C.accentInk : C.muted,
                    border: `1px solid ${ready ? C.accent : C.border}`,
                    cursor: ready ? "pointer" : "not-allowed",
                    fontFamily: C.mono,
                    fontSize: 12,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    transition: "background 0.2s ease, color 0.2s ease",
                  }}
                >
                  Check if your vertical is open →
                </motion.button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{ maxWidth: 900, margin: "0 auto" }}
            >
              {/* thesis recap, so they can see what is attached to the booking */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 20,
                }}
              >
                {FIELDS.map(([key, label]) => (
                  <span
                    key={key}
                    style={{
                      fontFamily: C.mono,
                      fontSize: 11,
                      color: C.mid,
                      border: `1px solid ${C.border}`,
                      background: C.panel,
                      padding: "7px 12px",
                    }}
                  >
                    <span style={{ color: C.muted }}>{label}: </span>
                    {thesis[key]}
                  </span>
                ))}
              </div>

              {/* Fixed height on purpose. A cross-origin iframe cannot
                  report its content height, so this has to clear
                  Calendly's tallest step (the details form, which grows
                  with each custom question) or the widget scrolls
                  inside itself. Tune if you add or remove questions. */}
              <iframe
                src={calendarSrc}
                title="Book a call with Deeno"
                scrolling="no"
                style={{
                  width: "100%",
                  height: 1150,
                  border: `1px solid ${C.border}`,
                  background: C.panel,
                  display: "block",
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </Reveal>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ borderTop: `1px solid ${C.border}`, padding: "40px 0" }}>
      <div style={{ ...wrap, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: F.stack, fontSize: 17, fontWeight: F.weight, letterSpacing: "-0.02em", color: C.ink }}>
          DEENO
        </span>
        <span style={{ fontFamily: C.mono, fontSize: 11, color: C.muted }}>© Deeno · deenobrands.agency</span>
      </div>
    </footer>
  );
}

export default function V2() {
  return (
    <main style={{ background: C.bg, fontFamily: F.stack, minHeight: "100vh" }}>
      <Progress />
      <Nav />
      <Hero />
      <LogoWall />
      <WhoWeServe />
      <Checklist />
      <Channels />
      <Messages />
      <Confidentiality />
      <Calculator />
      <Compare />
      <Timeline />
      <WhatWereNot />
      <FAQ />
      <Close />
      <Footer />
    </main>
  );
}
