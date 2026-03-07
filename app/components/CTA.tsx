"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Phone, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import MagneticButton from "./MagneticButton";
import SplitText from "./SplitText";

const perks = [
  "Free 30-min strategy call — no pitch",
  "Full competitor analysis included",
  "Zero commitment required",
  "Results within 30 days or we adjust",
];

export default function CTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="contact" ref={ref} className="bg-[#F5F0E8] text-[#0A0A0A]">
      <div className="max-w-6xl mx-auto px-6 py-28">
        <div className="grid lg:grid-cols-[1fr_420px] gap-16 items-start">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            <span className="text-[#FF5C28] text-[10px] font-bold tracking-[0.3em] uppercase mb-6 block">
              Get started
            </span>
            <h2
              className="font-black tracking-[-0.04em] leading-tight text-[#0A0A0A] mb-6"
              style={{ fontSize: "clamp(36px, 5.5vw, 72px)" }}
            >
              {inView && <SplitText text="Ready to dominate" delay={0.1} className="text-[#0A0A0A]" />}
              <br />
              {inView && <SplitText text="your market?" delay={0.3} className="text-[#0A0A0A]" />}
            </h2>
            <p className="text-[#0A0A0A]/50 leading-relaxed mb-10 max-w-md text-[15px]">
              Book your free growth audit. We&apos;ll review your current marketing,
              identify quick wins, and show you exactly how we&apos;d take your
              business to #1 in your market.
            </p>

            <div className="space-y-4 mb-12">
              {perks.map((p) => (
                <div key={p} className="flex items-center gap-3">
                  <CheckCircle2 size={15} className="text-[#FF5C28] shrink-0" />
                  <span className="text-[#0A0A0A]/60 text-sm">{p}</span>
                </div>
              ))}
            </div>

            {/* Contact */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="tel:+18005550000"
                className="flex items-center gap-3 bg-[#0A0A0A]/5 hover:bg-[#0A0A0A]/8 border border-[#0A0A0A]/10 rounded-xl px-5 py-3.5 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-[#FF5C28]/10 flex items-center justify-center shrink-0">
                  <Phone size={14} className="text-[#FF5C28]" />
                </div>
                <div>
                  <div className="text-[#0A0A0A]/40 text-[11px]">Call us</div>
                  <div className="text-[#0A0A0A] font-semibold text-sm">(800) 555-0000</div>
                </div>
              </a>
              <a
                href="mailto:kierin@deenobrands.agency"
                className="flex items-center gap-3 bg-[#0A0A0A]/5 hover:bg-[#0A0A0A]/8 border border-[#0A0A0A]/10 rounded-xl px-5 py-3.5 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-[#FF5C28]/10 flex items-center justify-center shrink-0">
                  <Mail size={14} className="text-[#FF5C28]" />
                </div>
                <div>
                  <div className="text-[#0A0A0A]/40 text-[11px]">Email</div>
                  <div className="text-[#0A0A0A] font-semibold text-sm">kierin@deenobrands.agency</div>
                </div>
              </a>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="bg-white border border-[#0A0A0A]/8 rounded-2xl p-7 shadow-sm"
          >
            <h3 className="font-bold text-xl text-[#0A0A0A] mb-1">Get Your Free Audit</h3>
            <p className="text-[#0A0A0A]/40 text-sm mb-6">Takes 2 minutes. No spam, ever.</p>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-3">
                {["First Name", "Last Name"].map((label) => (
                  <div key={label}>
                    <label className="text-[#0A0A0A]/40 text-xs mb-1.5 block">{label}</label>
                    <input
                      type="text"
                      placeholder={label === "First Name" ? "John" : "Smith"}
                      className="w-full bg-[#F0EBE3] border border-[#D8D3CB] rounded-xl px-4 py-3 text-sm text-[#0A0A0A] placeholder-[#0A0A0A]/25 focus:outline-none focus:border-[#FF5C28]/50 transition-colors"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-[#0A0A0A]/40 text-xs mb-1.5 block">Business Email</label>
                <input
                  type="email"
                  placeholder="john@atlashvac.com"
                  className="w-full bg-[#F0EBE3] border border-[#D8D3CB] rounded-xl px-4 py-3 text-sm text-[#0A0A0A] placeholder-[#0A0A0A]/25 focus:outline-none focus:border-[#FF5C28]/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-[#0A0A0A]/40 text-xs mb-1.5 block">Phone Number</label>
                <input
                  type="tel"
                  placeholder="(555) 000-0000"
                  className="w-full bg-[#F0EBE3] border border-[#D8D3CB] rounded-xl px-4 py-3 text-sm text-[#0A0A0A] placeholder-[#0A0A0A]/25 focus:outline-none focus:border-[#FF5C28]/50 transition-colors"
                />
              </div>

              <div>
                <label className="text-[#0A0A0A]/40 text-xs mb-1.5 block">Your Trade</label>
                <select className="w-full bg-[#F0EBE3] border border-[#D8D3CB] rounded-xl px-4 py-3 text-sm text-[#0A0A0A]/70 focus:outline-none focus:border-[#FF5C28]/50 transition-colors appearance-none">
                  <option value="">Select your trade...</option>
                  {["HVAC", "Plumbing", "Roofing", "Electrical", "Landscaping", "Pest Control", "Cleaning", "Other"].map(
                    (t) => <option key={t} value={t}>{t}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="text-[#0A0A0A]/40 text-xs mb-1.5 block">Monthly Marketing Budget</label>
                <select className="w-full bg-[#F0EBE3] border border-[#D8D3CB] rounded-xl px-4 py-3 text-sm text-[#0A0A0A]/70 focus:outline-none focus:border-[#FF5C28]/50 transition-colors appearance-none">
                  <option value="">Select budget...</option>
                  {["Under $1,000", "$1,000–$3,000", "$3,000–$7,000", "$7,000–$15,000", "$15,000+"].map(
                    (b) => <option key={b} value={b}>{b}</option>
                  )}
                </select>
              </div>

              <MagneticButton className="w-full" strength={0.15}>
                <button
                  type="submit"
                  className="w-full bg-[#FF5C28] hover:bg-[#e64f20] text-white font-bold py-4 rounded-xl transition-all duration-200 hover:shadow-[0_8px_30px_rgba(255,92,40,0.4)] flex items-center justify-center gap-2 text-sm"
                >
                  Book My Free Audit
                  <ArrowRight size={15} />
                </button>
              </MagneticButton>

              <p className="text-center text-[#0A0A0A]/25 text-xs">
                No credit card. No commitment. Just a real strategy call.
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
