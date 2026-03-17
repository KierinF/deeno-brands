import type { Metadata } from "next";
import IndustryPage, { type IndustryPageData } from "../components/IndustryPage";

export const metadata: Metadata = {
  title: "Commercial Roofing Lead Generation | Deeno",
  description:
    "We contact facility managers, property owners, and commercial developers in your market and book them on your calendar. Fully managed outbound for commercial roofing contractors.",
};

const data: IndustryPageData = {
  trade: "Commercial Roofing",
  image: "/roofing.png",
  headline: "Your next commercial roof is on a building that doesn't know you exist yet.",
  sub: "We find the facility managers and property owners with aging roofs in your market, contact them on your behalf, and book them on your calendar.",
  pains: [
    {
      problem: "You rely on storm chasers and referrals. When the weather is quiet, so is the pipeline.",
      solution: "We build a pipeline that runs year-round — not just when it rains.",
    },
    {
      problem: "Facility managers already have a roofing contractor. Getting approved as a vendor takes forever.",
      solution: "We get you in front of them at the right time — when a roof is aging, a project is coming, or their current contractor just let them down.",
    },
    {
      problem: "You bid commercial jobs and lose to competitors who already have the relationship.",
      solution: "We build the relationship before the bid. By the time you're quoting, you're already the trusted option.",
    },
    {
      problem: "Residential work is inconsistent. You need commercial contracts that scale.",
      solution: "One commercial roofing contract — a warehouse, a retail center, an office park — is worth 20 residential jobs. We go get those accounts.",
    },
  ],
  personas: [
    {
      title: "Facility Manager / Director of Facilities",
      desc: "Owns the roofing vendor relationship and the capital budget for roof maintenance and replacement. Your primary decision-maker for any building over 20,000 sq ft.",
    },
    {
      title: "Commercial Property Manager",
      desc: "Manages vendor approvals for commercial real estate portfolios. A single property management firm can mean roofing work across dozens of buildings.",
    },
    {
      title: "Commercial Real Estate Developer",
      desc: "New construction and full replacements on commercial builds. Developers need roofing subcontractors they can rely on across multiple projects.",
    },
    {
      title: "General Contractor",
      desc: "Subcontractor relationships for commercial roofing on new builds and renovations. GC relationships compound — one relationship feeds years of work.",
    },
    {
      title: "Industrial & Warehouse Operations Manager",
      desc: "Large square footage, flat roofing systems, and significant liability exposure. These accounts have budget and they value contractors who understand industrial requirements.",
    },
  ],
  processSteps: [
    {
      label: "ICP Build",
      detail:
        "We identify commercial buildings in your market by roof type, age, size, and ownership. Permit data tells us what was replaced and when — we target the buildings due for attention.",
    },
    {
      label: "Outreach",
      detail:
        "Cold email to facility directors and property managers in your service area. Every message is written specifically for commercial roofing — referencing building type, roof systems, and your track record on commercial projects.",
    },
    {
      label: "Qualify",
      detail:
        "We screen for roof age, upcoming capital budget cycles, and current vendor relationship. You only meet prospects with a real project on the horizon.",
    },
  ],
  callout: "A single commercial flat roof replacement is worth more than 15 residential jobs. We go get the commercial accounts.",
  faq: [
    {
      q: "Do you target commercial or residential?",
      a: "Commercial only. Facility managers, property owners, and commercial developers — not homeowners.",
    },
    {
      q: "What types of commercial roofing work do you generate leads for?",
      a: "Full replacements, TPO and flat roofing systems, roof maintenance agreements, and new construction subcontract work. We focus on high-value recurring relationships.",
    },
    {
      q: "How long until my first meeting?",
      a: "Most clients see their first qualified meeting within 30 days of launch.",
    },
    {
      q: "Will you work with another roofing contractor in my market?",
      a: "No. One commercial roofing company per market. Once your territory is claimed, it's closed.",
    },
    {
      q: "I tried Google Ads and got a lot of residential calls. That's not what I want.",
      a: "We don't do ads. We do direct outreach to commercial decision-makers — the people who control the budgets you actually want.",
    },
  ],
};

export default function CommercialRoofing() {
  return <IndustryPage data={data} />;
}
