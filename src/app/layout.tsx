import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Geist_Mono, Fraunces } from "next/font/google";
import AppProvider from "@/components/shared/app-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wanderboard",
  description:
    "Your travel board, organized. Turn messy trip ideas into editable, map-first multi-day travel boards.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${geistMono.variable} h-full antialiased`}
    >

      <body className="min-h-full flex flex-col">
        <AppProvider>{children}</AppProvider>
        {/* impeccable-live-start */}
        <Script src="http://localhost:8400/live.js" strategy="afterInteractive" />
        {/* impeccable-live-end */}
      </body>
    </html>
  );
}
