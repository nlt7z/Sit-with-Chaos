/**
 * Self-hosted fonts. These used to come from next/font/google, which downloads
 * the files during `next build`; on Vercel that fetch started failing
 * ("module not found" on the font files), breaking every deploy. The latin
 * WOFF2 files below are Google's own (fetched once, 2026-10-09) and ship with
 * the repo, so builds never touch the network. Variable files cover every
 * weight the pages ask for; CSS variable names match the old setup.
 */
import localFont from "next/font/local";

export const playfair = localFont({
  src: "./fonts/playfair-display-normal-400-900.woff2",
  weight: "400 900",
  variable: "--font-playfair",
  display: "swap",
});

export const dmSans = localFont({
  src: "./fonts/dm-sans-normal-100-1000.woff2",
  weight: "100 1000",
  variable: "--font-dm-sans",
  display: "swap",
});

export const jetbrainsMono = localFont({
  src: "./fonts/jetbrains-mono-normal-100-800.woff2",
  weight: "100 800",
  variable: "--font-jetbrains",
  display: "swap",
});

export const inter = localFont({
  src: "./fonts/inter-normal-100-900.woff2",
  weight: "100 900",
  variable: "--font-inter",
  display: "swap",
});

export const manrope = localFont({
  src: "./fonts/manrope-normal-200-800.woff2",
  weight: "200 800",
  variable: "--font-manrope",
  display: "swap",
});

export const sourceSerif = localFont({
  src: [
    { path: "./fonts/source-serif-4-normal-200-900.woff2", weight: "200 900", style: "normal" },
    { path: "./fonts/source-serif-4-italic-200-900.woff2", weight: "200 900", style: "italic" },
  ],
  variable: "--font-source-serif",
  display: "swap",
});

export const cormorant = localFont({
  src: "./fonts/cormorant-garamond-normal-300-700.woff2",
  weight: "300 700",
  display: "swap",
});

export const notoSerifJP = localFont({
  src: "./fonts/noto-serif-jp-normal-200-900.woff2",
  weight: "200 900",
  display: "swap",
});

export const shipporiMincho = localFont({
  src: [
    { path: "./fonts/shippori-mincho-normal-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/shippori-mincho-normal-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/shippori-mincho-normal-800.woff2", weight: "800", style: "normal" },
  ],
  display: "swap",
});

export const pressStart = localFont({
  src: "./fonts/press-start-2p-normal-400.woff2",
  weight: "400",
  display: "swap",
});
