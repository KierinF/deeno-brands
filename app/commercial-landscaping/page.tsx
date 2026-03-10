import type { Metadata } from "next";
import IndustryPage, { type IndustryPageData } from "../components/IndustryPage";

export const metadata: Metadata = {
  title: "Commercial Landscaping Lead Generation | Deeno",
  description:
    "We contact commercial property managers, corporate campus operators, and HOA management companies in your market and book them on your calendar. Recurring seasonal contracts, not one-time cleanups.",
};

const data: IndustryPageData = {
  trade: "Commercial Landscaping",
  image: "/dino.png",
  headline:
    "Commercial landscaping contracts don't come from yard signs. They come from relationships with the right property managers.",
  sub: "We contact commercial property managers, corporate campus operators, and HOA management companies in your market and book them on your calendar. Recurring seasonal contracts, not one-time cleanups.",
  pains: [
    {
      problem: "Your residential accounts churn every season. Commercial contracts don't.",
      solution:
        "One commercial property management company can be worth 10x a residential account and renew every year. We go get them.",
    },
    {
      problem: "You've driven past commercial properties and thought 'I could do better than that.'",
      solution:
        "We give you a systematic way to call on them instead of just thinking about it.",
    },
    {
      problem: "You bid commercial work but can't get in front of enough decision-makers.",
      solution: "Getting to the property manager is the hard part. That's what we do.",
    },
    {
      problem: "Your peak season comes and you're scrambling. Your off-season is dead.",
      solution:
        "Commercial contracts normalize your revenue across the year. That's the real value here.",
    },
  ],
  personas: [
    {
      title: "Property Management Company",
      desc: "Manages commercial, retail, or residential portfolios requiring ongoing landscaping maintenance. One PM company managing 15 properties can represent six figures in annual recurring revenue.",
    },
    {
      title: "Corporate Campus / Office Park Facilities Manager",
      desc: "Large properties with landscaping budgets and long contract terms. Corporate campuses prioritize reliability and consistency — which is your pitch.",
    },
    {
      title: "HOA Management Company",
      desc: "Manages multiple HOA communities and controls landscaping vendor selection across the portfolio. One HOA management company can mean work across dozens of communities.",
    },
    {
      title: "Municipal Parks and Recreation",
      desc: "Longer sales cycle, but recurring and substantial. Municipal landscaping contracts tend to be multi-year once awarded.",
    },
    {
      title: "Commercial Real Estate Developer",
      desc: "New development landscaping and initial install contracts. Developers need landscaping partners at multiple phases — install, establishment, and ongoing maintenance.",
    },
  ],
  callout:
    "One property management company managing 15 commercial properties. $8,000/month in recurring landscaping contracts. That's one account. That's what we're building toward.",
  processSteps: [
    {
      label: "ICP Build",
      detail:
        "We map property management companies and corporate campuses in your market by portfolio size and property type. The accounts managing 10+ commercial properties are your highest-value targets.",
    },
    {
      label: "Outreach",
      detail:
        "Cold email to property managers and LinkedIn outreach to facilities directors and HOA management companies in your service area. Personalized to their portfolio and current landscaping situation.",
    },
    {
      label: "Qualify",
      detail:
        "We confirm current landscaping vendor, contract renewal timeline, and number of properties in their portfolio. You only meet prospects who have a real reason to consider a new vendor.",
    },
  ],
  faq: [
    {
      q: "Do you generate leads for residential landscaping too?",
      a: "No. Commercial only — property managers, corporate campuses, and HOAs. Residential lead generation is a different model and we don't do it.",
    },
    {
      q: "Landscaping is relationship-driven. Does cold outreach work?",
      a: "It works when it's targeted and personal. Property managers hear from landscapers constantly — generic outreach fails. Ours doesn't, because we research before we reach out.",
    },
    {
      q: "Do contracts typically renew?",
      a: "Commercial landscaping contracts have some of the highest renewal rates of any trade service. The switching cost for a property manager is high. Once you're in, you tend to stay.",
    },
    {
      q: "How long until my first meeting?",
      a: "Most clients see their first qualified meeting within 30 days of launch. Property manager relationships sometimes take 60–90 days to fully develop — we handle the nurturing.",
    },
    {
      q: "Will you work with another landscaping company in my market?",
      a: "No. One landscaping company per market. Once your territory is claimed, it's closed.",
    },
  ],
};

export default function CommercialLandscaping() {
  return <IndustryPage data={data} />;
}
