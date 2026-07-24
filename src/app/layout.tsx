import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "GENDEX.EXE — Abderrahmane Hadjadj",
  description:
    "Cinematic interactive portfolio of Abderrahmane 'GenDex' Hadjadj — systems builder, automation engineer, and Discord bot developer from Médéa, Algeria.",
  keywords: [
    "GenDex",
    "Abderrahmane Hadjadj",
    "portfolio",
    "Three.js",
    "React Three Fiber",
    "Discord bot developer",
    "systems builder",
    "automation",
    "Algeria",
  ],
  authors: [{ name: "Abderrahmane Hadjadj" }],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "GENDEX.EXE — Abderrahmane Hadjadj",
    description:
      "Step into the mind of a systems builder working at 3:00 AM. A cinematic Three.js portfolio.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GENDEX.EXE — Abderrahmane Hadjadj",
    description:
      "Step into the mind of a systems builder working at 3:00 AM. A cinematic Three.js portfolio.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#050507",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${jetbrainsMono.variable} antialiased`}
        style={{
          background: "var(--gendex-bg)",
          color: "var(--gendex-text)",
          fontFamily: "var(--font-jetbrains-mono), var(--font-geist-mono), ui-monospace, monospace",
        }}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
