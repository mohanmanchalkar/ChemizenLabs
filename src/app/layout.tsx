import type { Metadata } from "next";
import { Source_Sans_3, IBM_Plex_Sans } from "next/font/google";
import { Header } from "@/components/Header";
import "./globals.css";
import "./effects.css";
import "./readability.css";
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
    "Learn molecular docking, AutoDock, PyMOL and ADMET analysis with Chemizen Labs. Practical workshops lasting up to 15 days.",
  icons: { icon: "/favicon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${sans.variable} ${serif.variable}`}>
        <Header />
        {children}
      </body>
    </html>
  );
}
