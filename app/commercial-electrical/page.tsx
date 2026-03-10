import type { Metadata } from "next";
import IndustryPage, { type IndustryPageData } from "../components/IndustryPage";

export const metadata: Metadata = {
  title: "Commercial Electrical Lead Generation | Deeno",
  description:
    "We connect commercial electricians with the GCs, developers, and facility directors awarding contracts in your market. Fully managed outbound. You close the work.",
};

const data: IndustryPageData = {
  trade: "Commercial Electrical",
  image: "/electrician.png",
  headline: "GCs are handing electrical work to someone. It should be you.",
  sub: "We connect commercial electricians with the GCs, developers, and facility directors awarding contracts in your market. Fully managed outreach. You close the work.",
  pains: [
    {
      problem: "GC relationships are everything in commercial electrical. You don't have enough of them.",
      solution: "We build them for you, systematically.",
    },
    {
      problem: "You're doing residential work but you have the crew and license for commercial.",
      solution:
        "Commercial pays more, lasts longer, and refers better. Let's go get it.",
    },
    {
      problem: "Bidding commercial work is a volume game. You're not in front of enough projects.",
      solution: "We get you in front of more bids than you can handle. You pick the ones worth winning.",
    },
    {
      problem: "You've built your business on word of mouth. It got you here. It won't get you to the next level.",
      solution: "The next level requires an outbound engine. That's what we build.",
    },
  ],
  personas: [
    {
      title: "General Contractor",
      desc: "The most important buyer in commercial electrical. GC relationships are the whole game — one strong GC relationship can be worth $500K+ in annual subcontract work.",
    },
    {
      title: "Commercial Real Estate Developer",
      desc: "Direct electrical contracts on new builds and renovations. Developers work with multiple subs per project and need reliable electrical partners for their pipeline.",
    },
    {
      title: "Facilities Director / Chief Engineer",
      desc: "Ongoing service contracts for existing commercial buildings. The facilities director controls the maintenance budget and vendor relationships for the property.",
    },
    {
      title: "Property Management Company",
      desc: "Electrical maintenance contracts across managed portfolios. One PM company can mean recurring work across dozens of commercial properties.",
    },
    {
      title: "Municipal and Government Facilities Managers",
      desc: "Longer sales cycle, but recurring and high-value work. Government facility relationships tend to be sticky once established.",
    },
  ],
  processNote:
    "The GC relationship is the unlock. One strong GC relationship can be worth $500K+ in annual subcontract work. You're not just getting meetings — you're building relationships that compound over time.",
  processSteps: [
    {
      label: "ICP Build",
      detail:
        "We map active commercial construction projects in your market and identify the GCs awarding electrical subcontracts. We also target facility directors and developers for service contract opportunities.",
    },
    {
      label: "Outreach",
      detail:
        "Cold email to GC project managers and LinkedIn outreach to commercial developers and facility directors. Every contact goes out under your name and your company — we're invisible.",
    },
    {
      label: "Qualify",
      detail:
        "We confirm project type, contract value range, timeline, and whether they're currently accepting bids from new subs. You only take meetings with decision-makers who are actively looking.",
    },
  ],
  faq: [
    {
      q: "What type of commercial electrical work do you generate leads for?",
      a: "New construction subcontracts, tenant improvement work, commercial service contracts, industrial electrical, and government facility work.",
    },
    {
      q: "Do I need to be licensed for commercial work before you start?",
      a: "Yes. We assume you're licensed for the work we're generating leads for.",
    },
    {
      q: "Can you target specific GCs I already want to work with?",
      a: "Yes. If you have a target list, we can build outreach around it. Your shortlist becomes our starting point.",
    },
    {
      q: "One GC relationship could be worth a lot. How do you protect that?",
      a: "Every contact is yours. We use your name and your company in all outreach. We're invisible — the relationship is always between you and them.",
    },
    {
      q: "Will you work with another electrician in my market?",
      a: "No. One electrical contractor per market. Once your territory is claimed, it's closed.",
    },
  ],
};

export default function CommercialElectrical() {
  return <IndustryPage data={data} />;
}
