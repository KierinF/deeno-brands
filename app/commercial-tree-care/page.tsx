import type { Metadata } from "next";
import IndustryPage, { type IndustryPageData } from "../components/IndustryPage";

export const metadata: Metadata = {
  title: "Commercial Tree Care Lead Generation | Deeno",
  description:
    "We contact HOAs, property managers, and commercial facility directors in your market and book them on your calendar. Fully managed outbound for arborists and tree care companies.",
};

const data: IndustryPageData = {
  trade: "Tree Care & Arborist",
  image: "/tree-care.png",
  headline: "The trees don't sell themselves.",
  sub: "HOAs, property managers, and commercial accounts are sitting in your market. They have trees that need attention and no arborist they trust. We get you in front of them.",
  pains: [
    {
      problem: "You grow by referral. When referrals slow down, so does revenue.",
      solution: "We build an outbound pipeline so your calendar isn't dependent on word of mouth.",
    },
    {
      problem: "HOAs and property managers have a guy. Getting in the door takes years.",
      solution: "We open the door with the right message at the right time. You don't wait years.",
    },
    {
      problem: "You bid commercial jobs and lose them to price. It feels like a race to the bottom.",
      solution: "We target accounts where quality matters more than price — HOAs, high-end properties, commercial facilities with liability exposure.",
    },
    {
      problem: "Your crews have capacity in the slow season. You need recurring commercial contracts to smooth it out.",
      solution: "Annual maintenance contracts and multi-property HOA agreements are the answer. We go get them.",
    },
  ],
  personas: [
    {
      title: "HOA Property Manager",
      desc: "Manages common area maintenance for homeowners associations. Trees, grounds, and storm cleanup all fall under their vendor relationships. HOAs over 50 units are the best-fit accounts.",
    },
    {
      title: "Commercial Property Manager",
      desc: "Controls vendor approvals for office parks, retail centers, and multi-tenant commercial buildings. One approval can mean work across an entire portfolio.",
    },
    {
      title: "Director of Facilities",
      desc: "Responsible for grounds maintenance at corporate campuses, hospitals, schools, and municipal properties. High budget, recurring need, long vendor relationships once established.",
    },
    {
      title: "Golf Course & Country Club Superintendent",
      desc: "Manages all grounds and tree maintenance for golf courses and private clubs. Specialized work with premium budgets and high standards.",
    },
    {
      title: "Municipality / Parks Department",
      desc: "Cities, towns, and county parks departments require licensed arborists for tree risk assessment, removals, and maintenance. Contract work with consistent scope.",
    },
  ],
  processSteps: [
    {
      label: "ICP Build",
      detail:
        "We identify HOAs, commercial property portfolios, and large-canopy commercial properties in your service area. We prioritize accounts where tree risk, liability, and aesthetics drive real purchasing decisions.",
    },
    {
      label: "Outreach",
      detail:
        "Direct outreach to HOA managers and property directors via email and phone. Every message references their property type and the specific value a certified arborist brings — not a generic landscaper.",
    },
    {
      label: "Qualify",
      detail:
        "We screen for current vendor relationship, upcoming contract renewals, and recent storm or liability events that create urgency. You meet accounts that are ready to talk.",
    },
  ],
  callout: "One HOA with 200 units is worth more than 200 individual homeowner calls. We go get the HOAs.",
  faq: [
    {
      q: "Do you target commercial or residential?",
      a: "Commercial and HOA. Property managers, facility directors, and HOA management companies — not individual homeowners.",
    },
    {
      q: "What types of tree care work do you generate leads for?",
      a: "Annual maintenance contracts, storm cleanup agreements, tree risk assessments, large removals, and multi-property HOA agreements. Recurring and high-value work.",
    },
    {
      q: "How long until my first meeting?",
      a: "Most clients see their first qualified meeting within 30 days of launch.",
    },
    {
      q: "Will you work with another tree care company in my market?",
      a: "No. One arborist per market, period. Once your territory is claimed, it's closed.",
    },
    {
      q: "We already have some commercial accounts. Why do we need outbound?",
      a: "Because the accounts you have came from who you knew. Outbound gets you into the accounts you don't know yet — and there are a lot of them.",
    },
  ],
};

export default function CommercialTreeCare() {
  return <IndustryPage data={data} />;
}
