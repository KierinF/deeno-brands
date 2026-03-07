"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "James Harrington",
    title: "Owner, Atlas HVAC",
    location: "Phoenix, AZ",
    avatar: "JH",
    rating: 5,
    text: "I was skeptical after getting burned by two other agencies. Deeno came in, audited everything, and within 60 days our phone was ringing non-stop. Best investment I've made in 10 years of business.",
  },
  {
    name: "Maria Ortega",
    title: "CEO, ProPlumb Co.",
    location: "Dallas, TX",
    avatar: "MO",
    rating: 5,
    text: "Our old website was embarrassing. Deeno built us a new one and paired it with an SEO strategy. We went from invisible on Google to the top 3 in our area. Our revenue is up 210% this year.",
  },
  {
    name: "Tom Ryder",
    title: "Owner, RoofCraft Pros",
    location: "Nashville, TN",
    avatar: "TR",
    rating: 5,
    text: "They don't just run ads — they actually care about the ROI. We track every dollar, every call. They cut our cost per lead by 74% while tripling our volume. Finally found a team I trust.",
  },
  {
    name: "Sandra Collins",
    title: "Owner, Collins Electric",
    location: "Austin, TX",
    avatar: "SC",
    rating: 5,
    text: "I've worked with 4 agencies before Deeno. Nobody else gave us this level of transparency and results. Monthly calls, real data, and a team that actually picks up the phone.",
  },
  {
    name: "Derek Walsh",
    title: "Founder, CleanSeal Pest",
    location: "Denver, CO",
    avatar: "DW",
    rating: 5,
    text: "We started with just Google Ads management and have since expanded to SEO and social. Every service has driven measurable ROI. They're the real deal.",
  },
  {
    name: "Rachel Kim",
    title: "Owner, Kim's Landscaping",
    location: "Seattle, WA",
    avatar: "RK",
    rating: 5,
    text: "The seasonal nature of landscaping made marketing tough. Deeno created a year-round strategy that fills our pipeline in slow months. Game changer for us.",
  },
];

export default function Testimonials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="testimonials" ref={ref} className="py-32 px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[300px] rounded-full bg-[#FF5C28]/5 blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <span className="text-[#FF5C28] text-xs font-semibold tracking-widest uppercase mb-4 block">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight">
            Don't take our word.
            <br />
            <span className="gradient-text">Take theirs.</span>
          </h2>
        </motion.div>

        {/* Masonry-style grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{
                duration: 0.6,
                delay: 0.05 * i,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="break-inside-avoid bg-[#0F0F18] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors"
            >
              <Quote size={20} className="text-[#FF5C28]/40 mb-4" />
              <p className="text-white/65 text-sm leading-relaxed mb-5">
                &ldquo;{t.text}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF5C28] to-orange-600 flex items-center justify-center text-white text-xs font-black">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-white/35 text-xs">{t.title} · {t.location}</div>
                </div>
                <div className="ml-auto flex">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} size={10} className="text-[#FF5C28] fill-[#FF5C28]" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
