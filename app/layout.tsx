import type { Metadata } from "next";
import "./globals.css";
import "@fontsource/bebas-neue";
import "@fontsource/dm-mono/400.css";
import "@fontsource/dm-mono/500.css";
import "@fontsource-variable/dm-sans";

export const metadata: Metadata = {
  title: "Deeno | Commercial Pipeline for Trades",
  description:
    "We book commercial meetings with facility managers, property owners, and GCs for HVAC and roofing contractors. Fully managed outbound. 1 client per market.",
  keywords:
    "commercial HVAC leads, commercial roofing leads, B2B trades marketing, outbound SDR for contractors, facility manager leads, HVAC lead generation",
  openGraph: {
    title: "Deeno | Commercial Pipeline for Trades",
    description:
      "We fill your commercial pipeline. You show up and close. Outsourced B2B pipeline development for HVAC and roofing contractors.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "'DM Sans Variable', 'DM Sans', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
