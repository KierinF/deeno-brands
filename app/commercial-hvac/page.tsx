import type { Metadata } from "next";
import IndustryPage, { type IndustryPageData } from "../components/IndustryPage";

export const metadata: Metadata = {
  title: "Commercial HVAC Lead Generation | Deeno",
  description:
    "We contact facility managers, property management companies, and commercial developers in your market and book them on your calendar. Fully managed outbound for commercial HVAC contractors.",
};

const data: IndustryPageData = {
  trade: "Commercial HVAC",
  image: "/hvac.png",
  headline: "Your next service contract is sitting with a facility manager who's never heard of you.",
  sub: "We find them, contact them, and book the meeting. You show up and close.",
  pains: [
    {
      problem: "You're great at the work. You have no system for finding commercial accounts.",
      solution: "We build the system and run it for you.",
    },
    {
      problem: "Facility managers don't respond to cold calls from people they don't know.",
      solution: "Ours do. We warm them before we ask.",
    },
    {
      problem: "You quote commercial jobs but the sales cycle takes months.",
      solution: "We nurture through the whole cycle so you don't have to.",
    },
    {
      problem: "Your crews have capacity. Your calendar doesn't.",
      solution: "Recurring maintenance contracts fix that. We go get them.",
    },
  ],
  personas: [
    {
      title: "Facility Manager / Director of Facilities",
      desc: "Holds the HVAC vendor relationship for the building. This is your primary target — they own the preventative maintenance contract and the service agreement renewal.",
    },
    {
      title: "Property Management Company",
      desc: "Manages commercial building portfolios and controls vendor approvals across multiple properties. One relationship here can mean work across dozens of buildings.",
    },
    {
      title: "Commercial Real Estate Developer",
      desc: "New construction, system installs, and ongoing service agreements. Developers need HVAC subcontractors at multiple phases of a project.",
    },
    {
      title: "Multi-Location Operations Director",
      desc: "Restaurant groups, retail chains, healthcare networks with 5+ locations. They need a single HVAC partner they can trust across the portfolio.",
    },
    {
      title: "General Contractor",
      desc: "Subcontractor relationships for mechanical work on new commercial builds. GC relationships compound — one good GC can feed years of subcontract work.",
    },
  ],
  processSteps: [
    {
      label: "ICP Build",
      detail:
        "We identify target buildings by type, square footage, system age, and ownership structure. Your ideal accounts exist — we just need to map them before we contact anyone.",
    },
    {
      label: "Outreach",
      detail:
        "Cold email to facility directors and LinkedIn outreach to property management companies in your service area. Every message is written specifically for your trade and your market.",
    },
    {
      label: "Qualify",
      detail:
        "We screen for current vendor relationship, contract renewal timeline, and authority to approve new vendors. You only meet prospects who are ready to have the conversation.",
    },
  ],
  faq: [
    {
      q: "Do you target commercial or residential?",
      a: "Commercial only. Facility managers and property owners, not homeowners. That's the whole model.",
    },
    {
      q: "What types of commercial HVAC work do you generate leads for?",
      a: "Preventative maintenance contracts, system replacements, new installs, and multi-site service agreements. We focus on recurring work, not one-off calls.",
    },
    {
      q: "How long until my first meeting?",
      a: "Most clients see their first qualified meeting within 30 days of launch. Some markets move faster.",
    },
    {
      q: "Will you work with my competitor in the same city?",
      a: "No. One HVAC company per market, period. Once your territory is claimed, it's closed.",
    },
    {
      q: "I tried cold outreach before and it didn't work.",
      a: "Tell us what you tried. We can usually tell you exactly what went wrong. Book the call.",
    },
  ],
};

export default function CommercialHVAC() {
  return <IndustryPage data={data} />;
}
