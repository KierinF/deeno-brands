"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Plus, Minus } from "lucide-react";

const faqs = [
  {
    q: "How long until I see results?",
    a: "For paid ads (Google/Meta), most clients see a measurable increase in leads within the first 2–4 weeks. SEO and organic results typically take 60–90 days to gain traction, and compound significantly over time. We always set realistic expectations upfront.",
  },
  {
    q: "Do you work with businesses outside of HVAC?",
    a: "Absolutely. We specialize in all home service trades including plumbing, roofing, electrical, landscaping, pest control, cleaning services, and more. Our strategies are proven across every trade vertical.",
  },
  {
    q: "What makes you different from other marketing agencies?",
    a: "We only work with home service businesses — it's all we do. That laser focus means we've already solved the problems you're facing. No learning curve. Real benchmarks. And we're obsessed with revenue-per-lead, not vanity metrics.",
  },
  {
    q: "How much does it cost?",
    a: "Pricing depends on your market size, competition, and which services make the most sense. After your free audit, we'll present a custom plan with transparent pricing. Most clients start between $1,500–$5,000/month in management fees, plus ad spend.",
  },
  {
    q: "Do you require long-term contracts?",
    a: "We offer month-to-month and quarterly agreements. We believe in earning your business every month. That said, our best results happen when we can execute a full 90-day strategy — that's when compounding really kicks in.",
  },
  {
    q: "Will I own my website and all the marketing assets?",
    a: "Yes — 100%. Everything we build for you, you own outright. Your website, ad accounts, content, analytics — it's all yours. We don't hold your assets hostage like some agencies do.",
  },
  {
    q: "How do I track results?",
    a: "You get a live dashboard showing calls, leads, ad spend, cost per lead, and revenue attribution. We also have a monthly strategy call to walk through what's working and what we're adjusting.",
  },
];

export default function FAQ() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" ref={ref} className="py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <span className="text-[#8B5CF6] text-xs font-semibold tracking-widest uppercase mb-4 block">
            FAQ
          </span>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">
            Questions we get
            <br />
            <span className="gradient-text">all the time.</span>
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={faq.q}
              initial={{ opacity: 0, y: 12 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.05 * i }}
              className="bg-[#0F0F18] border border-white/5 rounded-xl overflow-hidden hover:border-white/8 transition-colors"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4"
              >
                <span className="font-semibold text-sm md:text-base text-white/85 group-hover:text-white">
                  {faq.q}
                </span>
                <div className="shrink-0 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                  {open === i ? (
                    <Minus size={12} className="text-[#8B5CF6]" />
                  ) : (
                    <Plus size={12} className="text-white/40" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-white/45 text-sm leading-relaxed border-t border-white/5 pt-4">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
