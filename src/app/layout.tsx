import type { Metadata, Viewport } from "next";
import { Fraunces } from "next/font/google";
import localFont from "next/font/local";
import { TabBar } from "@/components/TabBar";
import { RegisterSW } from "@/components/RegisterSW";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK"],
});

// Japanese fonts are self-hosted and subset to the glyphs we use (scripts/make-fonts.mjs):
// 3 files / 330 KB instead of 148 unicode-range slices / 2.6 MB.
const zenMaru = localFont({
  variable: "--font-zen-maru",
  src: [
    { path: "./fonts/zen-maru-400.woff2", weight: "400" },
    { path: "./fonts/zen-maru-700.woff2", weight: "700" },
  ],
  fallback: ["Hiragino Maru Gothic ProN", "Yu Gothic", "Noto Sans JP", "system-ui", "sans-serif"],
});

const shippori = localFont({
  variable: "--font-shippori",
  src: [{ path: "./fonts/shippori-800.woff2", weight: "800" }],
  fallback: ["Hiragino Mincho ProN", "Yu Mincho", "Noto Serif JP", "serif"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Japan Saathi",
  description: "Your Japan travel companion for Indian travellers: diet-safe food, etiquette, budgets and taxi cards.",
  appleWebApp: { capable: true, title: "Saathi", statusBarStyle: "default" },
  icons: { icon: "/icons/icon.svg", apple: "/icons/apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#f6efe3",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fraunces.variable} ${zenMaru.variable} ${shippori.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <main className="flex-1 pb-28">{children}</main>
        <TabBar />
        <RegisterSW />
      </body>
    </html>
  );
}
