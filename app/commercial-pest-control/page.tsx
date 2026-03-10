import type { Metadata } from "next";
import IndustryPage, { type IndustryPageData } from "../components/IndustryPage";

export const metadata: Metadata = {
  title: "Commercial Pest Control Lead Generation | Deeno",
  description:
    "We contact commercial property managers, facility directors, and multi-location business operators in your market and book them on your calendar. Ongoing service agreements, not one-time calls.",
};

const data: IndustryPageData = {
  trade: "Commercial Pest Control",
  image: "/pest-removal.png",
  headline:
    "A pest problem in a commercial building isn't a nuisance. It's a liability. That's why property managers need a pest control partner they trust.",
  sub: "We contact commercial property managers, facility directors, and multi-location business operators in your market and book them on your calendar. Ongoing service agreements, not one-time calls.",
  pains: [
    {
      problem: "Residential pest control is seasonal and unpredictable. Commercial contracts aren't.",
      solution:
        "Property managers, restaurants, and healthcare facilities need ongoing service. That's recurring, predictable revenue every month.",
    },
    {
      problem:
        "Commercial accounts require compliance documentation, scheduling coordination, and proactive communication. Most pest control companies can't deliver that.",
      solution:
        "If you can, that's your differentiation. We make sure the right buyers know it.",
    },
    {
      problem: "You've tried Google ads and got homeowner calls. You want commercial accounts.",
      solution:
        "Those are two different buyers requiring two different outreach strategies. We only do the commercial one.",
    },
    {
      problem: "One restaurant group with 12 locations is worth more than 200 residential accounts.",
      solution: "We build you the pipeline to land accounts like that.",
    },
  ],
  personas: [
    {
      title: "Property Management Company",
      desc: "Multi-building commercial portfolios requiring ongoing IPM contracts. One PM company means recurring service across every property in their portfolio.",
    },
    {
      title: "Restaurant / Food Service Group",
      desc: "Multi-location operators with mandatory pest control compliance requirements. Restaurants can't afford a failed health inspection — they need a partner they can count on.",
    },
    {
      title: "Healthcare Facility Manager",
      desc: "Hospitals, clinics, and senior care facilities with strict regulatory requirements. Healthcare pest control requires specialized compliance documentation — that's your competitive advantage.",
    },
    {
      title: "Hotel / Hospitality Operator",
      desc: "Ongoing pest control is a brand and liability issue, not optional. Hotels can't risk a guest complaint or a bad review. They need proactive, documented service.",
    },
    {
      title: "Facilities Director / Chief Engineer",
      desc: "Large commercial buildings, corporate campuses, and industrial facilities. The facilities director owns the vendor relationship and the compliance documentation requirement.",
    },
  ],
  callout:
    "Your residential customers call when they have a problem. Your commercial customers call because not calling would cost them more.",
  processSteps: [
    {
      label: "ICP Build",
      detail:
        "We map commercial property managers, restaurant groups, and healthcare facilities in your market. We prioritize accounts with compliance requirements — they're your most motivated buyers.",
    },
    {
      label: "Outreach",
      detail:
        "Cold email to facility directors and LinkedIn outreach to property management companies and multi-location operators. We position your compliance capabilities as a selling point from the first message.",
    },
    {
      label: "Qualify",
      detail:
        "We confirm compliance requirements, current vendor relationship, and contract renewal timeline. You only meet prospects who have a genuine reason to evaluate a new provider.",
    },
  ],
  faq: [
    {
      q: "What types of commercial pest control accounts do you generate leads for?",
      a: "Property management companies, restaurant groups, healthcare facilities, hotels, corporate campuses, and industrial facilities.",
    },
    {
      q: "Commercial pest control requires more compliance and documentation. Can you speak to that in the outreach?",
      a: "Yes. We position your compliance capabilities and documentation processes as selling points in the outreach copy, not afterthoughts.",
    },
    {
      q: "How long do commercial pest control contracts typically run?",
      a: "Most commercial IPM contracts are annual with quarterly or monthly service visits. Renewal rates are high because switching vendors mid-contract creates audit and inspection risk.",
    },
    {
      q: "I'm a smaller operation. Can I handle commercial accounts?",
      a: "If you're licensed and equipped for commercial work, yes. We'll make sure we're targeting accounts that match your current capacity.",
    },
    {
      q: "Will you work with another pest control company in my market?",
      a: "No. One pest control company per market. Once your territory is claimed, it's closed.",
    },
  ],
};

export default function CommercialPestControl() {
  return <IndustryPage data={data} />;
}
