import type { Metadata } from "next";
import "./globals.css";
import "@fontsource/dm-mono/400.css";
import "@fontsource/dm-mono/500.css";
import "@fontsource-variable/archivo";
/* Wordmark faces for the logo wall only. Two placeholder logos are
   set in type, so they need faces distinct from the site's own. */
import "@fontsource-variable/manrope";
import "@fontsource/playfair-display/500.css";

export const metadata: Metadata = {
  title: "Deeno | Off-Market Deal Origination",
  description:
    "We put business owners looking to sell $2M to $20M businesses on your calendar. You pay only for meetings that show up and clear all six criteria. For PE firms, M&A advisors, business brokers, and search funds.",
  keywords:
    "deal origination, proprietary deal flow, off-market deals, owner meetings, search fund sourcing, M&A lead generation, business broker leads, pay per qualified meeting, lower middle market acquisitions",
  openGraph: {
    title: "Deeno | Off-Market Deal Origination",
    description:
      "You don't pay us until a meeting actually happens. Owners looking to sell $2M to $20M businesses, sourced against your thesis and priced per qualified meeting.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <style>{`html{scroll-behavior:smooth}`}</style>
      </head>
      <body style={{ fontFamily: "'Archivo Variable', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
