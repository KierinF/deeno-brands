"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Phone, Mail, ArrowRight, CheckCircle2 } from "lucide-react";

const perks = [
  "Free 30-min strategy call",
  "Competitor analysis included",
  "No commitment required",
  "Results within 30 days or we adjust",
];

export default function CTA() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="contact" ref={ref} className="py-32 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#0F0F18]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] rounded-full bg-[#FF5C28]/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="max-w-5xl mx-auto relative">
        <div className="grid lg:grid-cols-[1fr_420px] gap-12 items-start">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="text-[#FF5C28] text-xs font-semibold tracking-widest uppercase mb-4 block">
              Get started
            </span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight mb-6">
              Ready to fill
              <br />
              <span className="gradient-text">your schedule?</span>
            </h2>
            <p className="text-white/45 leading-relaxed mb-8 max-w-md">
              Book your free growth audit today. We'll review your current
              marketing, identify quick wins, and show you exactly how we'd grow
              your business.
            </p>

            {/* Perks */}
            <div className="space-y-3 mb-10">
              {perks.map((p) => (
                <div key={p} className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-[#FF5C28] shrink-0" />
                  <span className="text-white/60 text-sm">{p}</span>
                </div>
              ))}
            </div>

            {/* Contact options */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="tel:+18005550000"
                className="flex items-center gap-3 bg-white/5 hover:bg-white/8 border border-white/8 rounded-xl px-5 py-3.5 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#FF5C28]/10 flex items-center justify-center">
                  <Phone size={14} className="text-[#FF5C28]" />
                </div>
                <div>
                  <div className="text-white/35 text-xs">Call us now</div>
                  <div className="text-white font-semibold text-sm">
                    (800) 555-0000
                  </div>
                </div>
              </a>
              <a
                href="mailto:hello@deeno.co"
                className="flex items-center gap-3 bg-white/5 hover:bg-white/8 border border-white/8 rounded-xl px-5 py-3.5 transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-[#FF5C28]/10 flex items-center justify-center">
                  <Mail size={14} className="text-[#FF5C28]" />
                </div>
                <div>
                  <div className="text-white/35 text-xs">Email us</div>
                  <div className="text-white font-semibold text-sm">
                    hello@deeno.co
                  </div>
                </div>
              </a>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#16161F] border border-white/8 rounded-2xl p-7 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#FF5C28]/5 blur-[60px] pointer-events-none" />

            <div className="relative">
              <h3 className="font-bold text-xl mb-1">Get Your Free Audit</h3>
              <p className="text-white/35 text-sm mb-6">
                Takes 2 minutes. No spam, ever.
              </p>

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/40 text-xs mb-1.5 block">
                      First Name
                    </label>
                    <input
                      type="text"
                      placeholder="John"
                      className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#FF5C28]/40 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-white/40 text-xs mb-1.5 block">
                      Last Name
                    </label>
                    <input
                      type="text"
                      placeholder="Smith"
                      className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#FF5C28]/40 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white/40 text-xs mb-1.5 block">
                    Business Email
                  </label>
                  <input
                    type="email"
                    placeholder="john@atlashvac.com"
                    className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#FF5C28]/40 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-white/40 text-xs mb-1.5 block">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="(555) 000-0000"
                    className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#FF5C28]/40 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-white/40 text-xs mb-1.5 block">
                    Your Trade
                  </label>
                  <select className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-sm text-white/70 focus:outline-none focus:border-[#FF5C28]/40 transition-colors appearance-none">
                    <option value="" className="bg-[#16161F]">
                      Select your trade...
                    </option>
                    {[
                      "HVAC",
                      "Plumbing",
                      "Roofing",
                      "Electrical",
                      "Landscaping",
                      "Pest Control",
                      "Cleaning",
                      "Other",
                    ].map((t) => (
                      <option key={t} value={t} className="bg-[#16161F]">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-white/40 text-xs mb-1.5 block">
                    Monthly Marketing Budget
                  </label>
                  <select className="w-full bg-white/5 border border-white/8 rounded-xl px-4 py-3 text-sm text-white/70 focus:outline-none focus:border-[#FF5C28]/40 transition-colors appearance-none">
                    <option value="" className="bg-[#16161F]">
                      Select budget...
                    </option>
                    {[
                      "Under $1,000",
                      "$1,000–$3,000",
                      "$3,000–$7,000",
                      "$7,000–$15,000",
                      "$15,000+",
                    ].map((b) => (
                      <option key={b} value={b} className="bg-[#16161F]">
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#FF5C28] hover:bg-[#e64f20] text-white font-bold py-4 rounded-xl transition-all duration-200 hover:shadow-[0_0_30px_rgba(255,92,40,0.3)] active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
                >
                  Book My Free Audit
                  <ArrowRight size={16} />
                </button>

                <p className="text-center text-white/20 text-xs">
                  No credit card. No commitment. Just a real strategy call.
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
