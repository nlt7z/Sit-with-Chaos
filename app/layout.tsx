import type { Metadata, Viewport } from "next";
import { DM_Sans, JetBrains_Mono, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { LayoutClientChrome } from "@/components/LayoutClientChrome";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

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
  metadataBase: new URL("https://www.nltstudio7.space"),
  title: "Yuan Fang — Product Design Builder",
  description:
    "A UX designer pairing AI-native speed with a fine-art command of craft and a relentless drive to build — turning ambiguity into clear product direction and working prototypes.",
  openGraph: {
    title: "Yuan Fang — Product Design Builder",
    description: "Portfolio of Yuan Fang, MS HCDE @ UW",
    url: "https://www.nltstudio7.space",
    images: [
      {
        url: "/assets/og-card.png",
        width: 1200,
        height: 630,
        alt: "Yuan Fang — Product Design Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yuan Fang — Product Design Builder",
    description: "Portfolio of Yuan Fang, MS HCDE @ UW",
    images: ["/assets/og-card.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${playfair.variable} ${dmSans.variable} ${jetbrainsMono.variable} font-sans antialiased text-[#1D1D1F] bg-white`}
      >
        {/* Intro veil is only for the homepage. The pathname check keeps the
            data-intro flag (and therefore the black ::before veil) off every
            other route so case-study / lab pages don't flash black. */}
        <Script
          id="intro-veil"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(location.pathname==='/'&&!sessionStorage.getItem('yf-intro-played-v1')){document.documentElement.dataset.intro='pending';setTimeout(function(){if(document.documentElement.dataset.intro==='pending'){delete document.documentElement.dataset.intro;}},4000);}}catch(e){try{delete document.documentElement.dataset.intro;}catch(_){}}})();`,
          }}
        />
        <LayoutClientChrome>{children}</LayoutClientChrome>
      </body>
    </html>
  );
}
