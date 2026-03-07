import type { Metadata } from "next";
import "./globals.css";

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
      <body
        className="antialiased"
      >
        {children}
      </body>
    </html>
  );
}
