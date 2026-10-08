import type { Metadata } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/Header";
import { CustomCursor } from "@/components/CustomCursor";
import { ScrollTransitions } from "@/components/ScrollTransitions";
import "./globals.css";
import "./effects.css";
import "./readability.css";
import "./brochure.css";
import "./community.css";
const script = localFont({
  src: "./fonts/allura-latin.woff2",
  weight: "400",
  variable: "--font-script",
  display: "swap",
});
const sans = localFont({
  src: "./fonts/source-sans-3-latin.woff2",
  weight: "200 900",
  variable: "--font-sans",
  display: "swap",
});
const serif = localFont({
  src: "./fonts/ibm-plex-sans-latin.woff2",
  weight: "100 700",
  variable: "--font-serif",
  display: "swap",
});
export const metadata: Metadata = {
  title: {
    default: "Chemizen Labs — CADD & Molecular Docking Workshops",
    template: "%s | Chemizen Labs",
  },
  description:
    "Hands-on online workshops and internships in network pharmacology, molecular docking and computational drug discovery with Chemizen Labs.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png" },
    ],
    apple: "/favicon.png",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${sans.variable} ${serif.variable} ${script.variable}`}>
        <CustomCursor />
        <ScrollTransitions />
        <Header />
        {children}
      </body>
    </html>
  );
}
