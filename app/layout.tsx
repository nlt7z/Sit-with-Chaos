import type { Metadata, Viewport } from "next";
import { DM_Sans, JetBrains_Mono, Playfair_Display } from "next/font/google";
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
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        {/* Intro veil is only for the homepage. The pathname check keeps the
            data-intro flag (and therefore the black ::before veil) off every
            other route so case-study / lab pages don't flash black. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(location.pathname==='/'&&!sessionStorage.getItem('yf-intro-played-v1')){document.documentElement.dataset.intro='pending';setTimeout(function(){if(document.documentElement.dataset.intro==='pending'){delete document.documentElement.dataset.intro;}},1500);var l=document.createElement('link');l.rel='preload';l.as='image';l.href='/assets/logo.png';l.setAttribute('fetchpriority','high');document.head.appendChild(l);}}catch(e){try{delete document.documentElement.dataset.intro;}catch(_){}}})();`,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${playfair.variable} ${dmSans.variable} ${jetbrainsMono.variable} font-sans antialiased text-[#1D1D1F] bg-white`}
      >
        <LayoutClientChrome>{children}</LayoutClientChrome>
      </body>
    </html>
  );
}
