import type { Metadata, Viewport } from "next";
import { Fraunces, Shippori_Mincho_B1, Zen_Maru_Gothic } from "next/font/google";
import { TabBar } from "@/components/TabBar";
import { RegisterSW } from "@/components/RegisterSW";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

const zenMaru = Zen_Maru_Gothic({
  variable: "--font-zen-maru",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

const shippori = Shippori_Mincho_B1({
  variable: "--font-shippori",
  weight: ["500", "800"],
  subsets: ["latin"],
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
