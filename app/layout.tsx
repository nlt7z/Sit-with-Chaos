import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";
import { LayoutClientChrome } from "@/components/LayoutClientChrome";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Yuan Fang — UX Designer",
  description:
    "A UX designer using AI as a core capability to iterate fast and turn ambiguity into clear product direction.",
  openGraph: {
    title: "Yuan Fang — UX Designer",
    description: "Portfolio of Yuan Fang, MS HCDE @ UW",
    url: "https://fangyuan7.com",
    images: [
      {
        url: "/assets/hero-orb.png",
        width: 1200,
        height: 1200,
        alt: "Yuan Fang — UX Designer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yuan Fang — UX Designer",
    description: "Portfolio of Yuan Fang, MS HCDE @ UW",
    images: ["/assets/hero-orb.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${playfair.variable} ${dmSans.variable} ${jetbrainsMono.variable} font-sans antialiased text-[#1D1D1F] bg-white`}
      >
        <LayoutClientChrome>{children}</LayoutClientChrome>
      </body>
    </html>
  );
}
