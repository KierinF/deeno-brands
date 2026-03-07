"use client";

import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Star, Quote } from "lucide-react";
import Marquee from "./Marquee";
import SplitText from "./SplitText";

const testimonials = [
  {
    name: "James Harrington",
    title: "Owner, Atlas HVAC",
    avatar: "JH",
    rating: 5,
    text: "I was skeptical after getting burned by two other agencies. Deeno came in, audited everything, and within 60 days our phone was ringing non-stop. Best investment I've made in 10 years.",
  },
  {
    name: "Maria Ortega",
    title: "CEO, ProPlumb Co.",
    avatar: "MO",
    rating: 5,
    text: "From invisible to top 3 on Google. Our revenue is up 210% this year. The ROI is undeniable — Deeno is the real deal.",
  },
  {
    name: "Tom Ryder",
    title: "Owner, RoofCraft Pros",
    avatar: "TR",
    rating: 5,
    text: "They cut our cost per lead by 74% while tripling our volume. Finally found a team I trust with my ad spend.",
  },
  {
    name: "Sandra Collins",
    title: "Owner, Collins Electric",
    avatar: "SC",
    rating: 5,
    text: "I've worked with 4 agencies before Deeno. Nobody else gave us this level of transparency. Monthly calls, real data, and a team that picks up the phone.",
  },
  {
    name: "Derek Walsh",
    title: "Founder, CleanSeal Pest",
    avatar: "DW",
    rating: 5,
    text: "Started with just Google Ads and have since expanded to SEO and social. Every service has driven measurable ROI. They're exceptional.",
  },
  {
    name: "Rachel Kim",
    title: "Owner, Kim's Landscaping",
    avatar: "RK",
    rating: 5,
    text: "Deeno created a year-round strategy that fills our pipeline even in slow months. Game changer for a seasonal business.",
  },
  {
    name: "Brad Torres",
    title: "Owner, Torres Roofing",
    avatar: "BT",
    rating: 5,
    text: "We went from 8 leads a month to 60+. Our crew is fully booked 3 months out. Couldn't be happier with the results.",
  },
  {
    name: "Lisa Park",
    title: "CEO, Park HVAC",
    avatar: "LP",
    rating: 5,
    text: "The website they built converts like crazy. Our lead form fills tripled within the first two weeks of launch.",
  },
];

function TestimonialCard({ t }: { t: typeof testimonials[0] }) {
  return (
    <div className="w-[340px] mx-3 bg-[#0F0F18] border border-white/6 rounded-2xl p-6 shrink-0">
      <Quote size={18} className="text-[#8B5CF6]/35 mb-4" />
      <p className="text-white/60 text-sm leading-relaxed mb-5 line-clamp-4">
        &ldquo;{t.text}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8B5CF6] to-orange-700 flex items-center justify-center text-white text-[10px] font-black shrink-0">
          {t.avatar}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-sm text-white truncate">{t.name}</div>
          <div className="text-white/30 text-xs truncate">{t.title}</div>
        </div>
        <div className="ml-auto flex shrink-0">
          {[...Array(t.rating)].map((_, i) => (
            <Star key={i} size={10} className="text-[#8B5CF6] fill-[#8B5CF6]" />
          ))}
        </div>
      </div>
    </div>
  );
}

const row1 = testimonials.slice(0, 4);
const row2 = testimonials.slice(4);

export default function Testimonials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="testimonials" ref={ref} className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[300px] rounded-full bg-[#8B5CF6]/4 blur-[100px]" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative mb-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <span className="text-[#8B5CF6] text-xs font-semibold tracking-widest uppercase mb-4 block">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-6xl font-black tracking-[-0.03em] leading-tight">
            {inView && <SplitText text="Don't take our word." delay={0.1} />}
            <br />
            {inView && <SplitText text="Take theirs." delay={0.35} className="gradient-text" />}
          </h2>
        </motion.div>
      </div>

      {/* Row 1 — scrolls left */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.3, duration: 0.7 }}
        className="mb-4"
      >
        <Marquee direction="left" duration={40}>
          {row1.map((t) => (
            <TestimonialCard key={t.name} t={t} />
          ))}
        </Marquee>
      </motion.div>

      {/* Row 2 — scrolls right */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : {}}
        transition={{ delay: 0.45, duration: 0.7 }}
      >
        <Marquee direction="right" duration={36}>
          {row2.map((t) => (
            <TestimonialCard key={t.name} t={t} />
          ))}
        </Marquee>
      </motion.div>
    </section>
  );
}
