import type { Metadata } from "next";
import IndustryPage, { type IndustryPageData } from "../components/IndustryPage";

export const metadata: Metadata = {
  title: "Commercial Plumbing Lead Generation | Deeno",
  description:
    "We contact property managers, commercial developers, and facility directors in your market and book them on your calendar. Ongoing service contracts, not one-off calls.",
};

const data: IndustryPageData = {
  trade: "Commercial Plumbing",
  image: "/plumbing.png",
  headline:
    "A property management company with 30 buildings needs a plumber on call. That plumber should be you.",
  sub: "We contact property managers, commercial developers, and facility directors in your market and book them on your calendar. Ongoing service contracts, not one-off calls.",
  pains: [
    {
      problem: "You're doing emergency calls. You want service contracts.",
      solution:
        "The difference between feast-or-famine and predictable revenue is a handful of property management relationships. We go get them.",
    },
    {
      problem: "Property managers have a plumber. You need to be the next one they call.",
      solution: "Preferred vendor lists turn over. We make sure you're in front of them when they do.",
    },
    {
      problem: "You're competing with plumbers who've had the same commercial accounts for ten years.",
      solution:
        "Those accounts aren't as loyal as they seem. One bad job, one slow response — and they're looking. We make sure they find you.",
    },
    {
      problem: "Commercial plumbing pays more and calls less. You just can't crack the right accounts.",
      solution: "That's exactly what we solve.",
    },
  ],
  personas: [
    {
      title: "Property Management Company",
      desc: "The single most valuable commercial plumbing buyer. One PM company managing 20+ buildings is years of recurring work — emergency calls, planned maintenance, and full system replacements.",
    },
    {
      title: "Facilities Director / Chief Engineer",
      desc: "Manages mechanical maintenance for a single large commercial building or campus. Controls the vendor budget and the preferred vendor list.",
    },
    {
      title: "Commercial Real Estate Developer",
      desc: "Plumbing on new builds and major renovations. Developers need reliable plumbing subcontractors at multiple stages of every project.",
    },
    {
      title: "General Contractor",
      desc: "Plumbing subcontracts on commercial construction projects. Strong GC relationships create consistent pipeline across the projects they're building.",
    },
    {
      title: "Restaurant / Hospitality Group",
      desc: "Multi-location commercial kitchens, grease trap maintenance, and emergency service. Restaurant groups need a plumber they can rely on across every location.",
    },
  ],
  processSteps: [
    {
      label: "ICP Build",
      detail:
        "We map property management companies in your market by portfolio size — the ones managing 10+ buildings are your best accounts. We also identify commercial developers and facility directors in your service area.",
    },
    {
      label: "Outreach",
      detail:
        "Cold email to property managers and LinkedIn outreach to facilities directors in commercial buildings within your service radius. Personalized to their portfolio size and property types.",
    },
    {
      label: "Qualify",
      detail:
        "We confirm current vendor status, contract renewal window, and number of properties managed. You only meet prospects who have a real reason to have the conversation.",
    },
  ],
  faq: [
    {
      q: "What type of commercial plumbing work do you generate leads for?",
      a: "Preferred vendor relationships with property managers, commercial service contracts, new construction subcontracts, and facility maintenance agreements. We focus on recurring work.",
    },
    {
      q: "Property managers already have plumbers. Why would they switch?",
      a: "They're not always switching — they're often adding a backup or a preferred vendor for specific property types. We position you for that conversation.",
    },
    {
      q: "How long are the sales cycles for commercial plumbing accounts?",
      a: "Property manager relationships typically take 30–90 days to develop. We handle the nurturing so you don't have to.",
    },
    {
      q: "Will you work with another plumber in my market?",
      a: "No. One plumbing contractor per market. Once your territory is claimed, it's closed.",
    },
    {
      q: "I've never done outbound before. What do I actually need to do?",
      a: "Show up to the meetings we book. That's it. We handle everything before the meeting — the research, the outreach, the follow-up, the scheduling.",
    },
  ],
};

export default function CommercialPlumbing() {
  return <IndustryPage data={data} />;
}
