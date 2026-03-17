import type { Metadata } from "next";
import IndustryPage, { type IndustryPageData } from "../components/IndustryPage";

export const metadata: Metadata = {
  title: "Commercial Cleaning Lead Generation | Deeno",
  description:
    "We contact facility managers, property management companies, and building owners in your market and book them on your calendar. Fully managed outbound for commercial cleaning companies.",
};

const data: IndustryPageData = {
  trade: "Commercial Cleaning",
  image: "/commercial-cleaning.png",
  headline: "Your building is spotless. Your contract pipeline isn't.",
  sub: "We get you in front of the facility managers and property owners who control the cleaning contracts — and book them on your calendar. You show up and close.",
  pains: [
    {
      problem: "You do excellent work but every new contract comes from someone you already know.",
      solution: "We open new doors. Systematically, in your market, every week.",
    },
    {
      problem: "Facility managers have a vendor. They don't take cold calls from cleaning companies.",
      solution: "We warm them before we ask. By the time you meet, they already know why you're different.",
    },
    {
      problem: "You quoted a big commercial account and never heard back.",
      solution: "We stay in contact through the full sales cycle so a slow decision doesn't mean a lost deal.",
    },
    {
      problem: "Your crews have open time. You need more recurring contracts to fill it.",
      solution: "Recurring commercial contracts are the whole model. That's what we go get.",
    },
  ],
  personas: [
    {
      title: "Facility Manager / Director of Facilities",
      desc: "Controls the cleaning vendor relationship for the building. This is your primary target — they set the spec, approve the vendor, and renew the contract.",
    },
    {
      title: "Property Management Company",
      desc: "Manages commercial and residential portfolios and controls vendor approvals across multiple properties. One relationship here can mean contracts across dozens of buildings.",
    },
    {
      title: "Office Park & Corporate Campus Manager",
      desc: "Responsible for janitorial services across shared commercial spaces. High square footage, consistent schedule, recurring revenue.",
    },
    {
      title: "Healthcare Facility Operations Manager",
      desc: "Hospitals, medical offices, and clinics have strict cleaning standards and significant budgets. They need vendors who understand compliance.",
    },
    {
      title: "Hospitality & Venue Operations Director",
      desc: "Hotels, event venues, and conference centers require daily cleaning at scale. Turnover cleaning and recurring contracts both in play.",
    },
  ],
  processSteps: [
    {
      label: "ICP Build",
      detail:
        "We map commercial buildings in your market by type, size, and ownership. Office parks, medical facilities, multi-tenant buildings — we identify the accounts worth pursuing before we contact anyone.",
    },
    {
      label: "Outreach",
      detail:
        "Cold email to facility directors and property managers in your service area. Every message is written specifically for commercial cleaning — referencing their building type, their standards, your track record.",
    },
    {
      label: "Qualify",
      detail:
        "We screen for contract renewal timelines, current vendor satisfaction, and decision authority. You only meet prospects who are open to making a change.",
    },
  ],
  callout: "One commercial office park contract is worth more than 50 residential cleans. We go get the office parks.",
  faq: [
    {
      q: "Do you target commercial or residential?",
      a: "Commercial only. Facility managers, property managers, and building owners — not homeowners. That's the whole model.",
    },
    {
      q: "What size accounts do you go after?",
      a: "We focus on recurring commercial contracts — office buildings, medical facilities, multi-tenant properties, and commercial real estate portfolios. We're not chasing one-off jobs.",
    },
    {
      q: "How long until my first meeting?",
      a: "Most clients see their first qualified meeting within 30 days of launch. Some markets move faster.",
    },
    {
      q: "Will you work with my competitor in the same city?",
      a: "No. One commercial cleaning company per market, period. Once your territory is claimed, it's closed.",
    },
    {
      q: "I tried marketing before and didn't get commercial accounts.",
      a: "Marketing builds awareness. We build pipeline. There's a difference — book the call and we'll show you.",
    },
  ],
};

export default function CommercialCleaning() {
  return <IndustryPage data={data} />;
}
