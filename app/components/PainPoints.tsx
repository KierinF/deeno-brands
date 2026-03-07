"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { XCircle, CheckCircle2 } from "lucide-react";

const pains = [
  "Wasting money on ads that don't convert",
  "Phone not ringing enough in slow season",
  "Competitors ranking above you on Google",
  "Website looks outdated and loses trust",
  "No idea which marketing actually works",
  "Chasing leads instead of closing jobs",
];

const gains = [
  "Campaigns optimized for booked appointments, not clicks",
  "Consistent lead flow 12 months a year",
  "Dominate local search — maps + organic",
  "A site that converts visitors into calls",
  "Real dashboards, real ROI, full transparency",
  "Pre-qualified leads ready to buy",
];

export default function PainPoints() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 right-0 w-[600px] h-[400px] rounded-full bg-[#FF5C28]/5 blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-16"
        >
          <span className="text-[#FF5C28] text-xs font-semibold tracking-widest uppercase mb-4 block">
            Sound familiar?
          </span>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            Tired of marketing that
            <br />
            <span className="gradient-text">drains your budget?</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Before */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#0F0F18] border border-white/5 rounded-2xl p-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <XCircle size={16} className="text-red-400" />
              </div>
              <span className="text-white/50 font-semibold text-sm">
                Without Deeno
              </span>
            </div>
            <div className="space-y-4">
              {pains.map((pain, i) => (
                <motion.div
                  key={pain}
                  initial={{ opacity: 0, x: -10 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.07, duration: 0.5 }}
                  className="flex items-start gap-3"
                >
                  <XCircle
                    size={16}
                    className="text-red-400/60 mt-0.5 shrink-0"
                  />
                  <span className="text-white/50 text-sm leading-relaxed">
                    {pain}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* After */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#0F0F18] border border-[#FF5C28]/15 rounded-2xl p-8 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#FF5C28]/5 to-transparent pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-full bg-[#FF5C28]/10 border border-[#FF5C28]/20 flex items-center justify-center">
                  <CheckCircle2 size={16} className="text-[#FF5C28]" />
                </div>
                <span className="text-[#FF5C28] font-semibold text-sm">
                  With Deeno
                </span>
              </div>
              <div className="space-y-4">
                {gains.map((gain, i) => (
                  <motion.div
                    key={gain}
                    initial={{ opacity: 0, x: 10 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.4 + i * 0.07, duration: 0.5 }}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2
                      size={16}
                      className="text-[#FF5C28] mt-0.5 shrink-0"
                    />
                    <span className="text-white/80 text-sm leading-relaxed">
                      {gain}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
