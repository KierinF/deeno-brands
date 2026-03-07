import type { Metadata } from "next";
import "./globals.css";
import Cursor from "./components/Cursor";
import Intro from "./components/Intro";

export const metadata: Metadata = {
  title: "Deeno Brands | Home Services Marketing Agency",
  description:
    "The #1 marketing agency for HVAC, plumbing, roofing & electrical companies. SEO, Google Ads, website design & social media that fills your schedule.",
  keywords:
    "home services marketing, HVAC marketing, plumbing marketing, roofing SEO, local SEO, Google Ads home services",
  openGraph: {
    title: "Deeno Brands | Home Services Marketing Agency",
    description:
      "More booked jobs. Less wasted budget. We build unfair marketing advantages for home service businesses.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Intro />
        <Cursor />
        {children}
      </body>
    </html>
  );
}
