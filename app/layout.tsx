import type { Metadata, Viewport } from "next";
import { Jost, JetBrains_Mono, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-mono-jb",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

const SITE = "https://ayansh-portfolio.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Aayansh Singh — Full-Stack Developer",
  description:
    "Full-stack developer in Noida, India. Graph-based developer tooling, interactive learning platforms, and systems work in TypeScript, React, Node and C++.",
  keywords: [
    "Aayansh Singh",
    "full-stack developer",
    "developer tooling",
    "TypeScript",
    "React",
    "Next.js",
    "Node",
    "C++",
    "Noida",
  ],
  authors: [{ name: "Aayansh Singh", url: "https://github.com/Ayansh0209" }],
  openGraph: {
    title: "Aayansh Singh — Full-Stack Developer",
    description:
      "Graph-based developer tooling, interactive learning platforms, and systems work.",
    url: SITE,
    siteName: "Aayansh Singh",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aayansh Singh — Full-Stack Developer",
    description:
      "Graph-based developer tooling, interactive learning platforms, and systems work.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${jost.variable} ${jetbrains.variable} ${inter.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
