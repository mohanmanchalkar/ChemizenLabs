import type { Metadata } from "next";
import { Source_Sans_3, IBM_Plex_Sans, Allura } from "next/font/google";
import { Header } from "@/components/Header";
import { CustomCursor } from "@/components/CustomCursor";
import { ScrollTransitions } from "@/components/ScrollTransitions";
import "./globals.css";
import "./effects.css";
import "./readability.css";
import "./brochure.css";
const script = Allura({ subsets: ["latin"], weight: "400", variable: "--font-script", display: "swap" });
const sans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const serif = IBM_Plex_Sans({
  subsets: ["latin"],
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
