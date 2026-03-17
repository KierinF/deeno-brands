import type { Metadata } from "next";
import IndustryPage, { type IndustryPageData } from "../components/IndustryPage";

export const metadata: Metadata = {
  title: "Commercial Waste Management Lead Generation | Deeno",
  description:
    "We contact facility managers, property owners, and commercial operators in your market and book them on your calendar. Fully managed outbound for waste haulers and waste management companies.",
};

const data: IndustryPageData = {
  trade: "Waste Management",
  image: "/waste-management.png",
  headline: "There are commercial accounts in your market hauling with someone else. Let's fix that.",
  sub: "We identify commercial properties, restaurants, and facilities in your service area and get your company in front of the people who control the hauling contracts.",
  pains: [
    {
      problem: "You lose accounts to bigger haulers on price, even when your service is better.",
      solution: "We target accounts where reliability and local service matter — and we make that case before you ever get on a call.",
    },
    {
      problem: "Most new accounts come from drivers noticing a competitor's container. It's not a system.",
      solution: "We build the system — targeted outreach to decision-makers before a competitor container shows up.",
    },
    {
      problem: "Commercial contracts are worth 10x residential but take longer to close.",
      solution: "We nurture through the full cycle. A slow contract decision doesn't become a lost account.",
    },
    {
      problem: "You have trucks and capacity. You need more route density in specific areas.",
      solution: "We target geographic clusters — building your density in the routes that matter most.",
    },
  ],
  personas: [
    {
      title: "Facility Manager / Director of Facilities",
      desc: "Controls the waste hauling vendor for commercial buildings, industrial facilities, and office parks. They own the contract and the renewal decision.",
    },
    {
      title: "Restaurant Group Operations Director",
      desc: "Multi-location restaurant groups need reliable hauling across all locations. One relationship here means contracts across the entire portfolio.",
    },
    {
      title: "Commercial Property Manager",
      desc: "Manages vendor relationships for commercial buildings and retail centers. Waste is a line item they review at every renewal.",
    },
    {
      title: "Construction Project Manager",
      desc: "Roll-off and debris removal for construction and demolition projects. High-volume, recurring need across active job sites.",
    },
    {
      title: "Retail & Shopping Center Operations",
      desc: "Malls, strip centers, and retail parks generate consistent commercial waste volume with long-term vendor relationships once established.",
    },
  ],
  processSteps: [
    {
      label: "ICP Build",
      detail:
        "We map commercial properties, restaurant clusters, industrial facilities, and construction activity in your service area. We prioritize accounts by volume potential and geographic fit for your routes.",
    },
    {
      label: "Outreach",
      detail:
        "Targeted outreach to facility managers and operations directors via email and phone. Every message is specific to their industry and the real cost of an unreliable hauler.",
    },
    {
      label: "Qualify",
      detail:
        "We screen for current contract terms, renewal timelines, and pain points with their existing vendor. You only meet accounts that are open to switching or adding a hauler.",
    },
  ],
  callout: "A single commercial route with 20 accounts is worth more than 200 residential pickups. We go get the commercial accounts.",
  faq: [
    {
      q: "Do you target commercial or residential?",
      a: "Commercial only. Facility managers, restaurant operators, property managers, and commercial developers — not residential customers.",
    },
    {
      q: "What types of waste management accounts do you target?",
      a: "Commercial hauling contracts, roll-off rental accounts, recycling programs, and specialty waste. We focus on recurring commercial relationships.",
    },
    {
      q: "How long until my first meeting?",
      a: "Most clients see their first qualified meeting within 30 days of launch.",
    },
    {
      q: "Will you work with another waste hauler in my market?",
      a: "No. One waste management company per market. Once your territory is claimed, it's closed.",
    },
    {
      q: "The big national haulers dominate our market. Can outbound still work?",
      a: "Yes. Local operators win on service, flexibility, and relationships — not price. We make that case to the right people.",
    },
  ],
};

export default function CommercialWasteManagement() {
  return <IndustryPage data={data} />;
}
