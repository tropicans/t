import type { Metadata } from "next";
import { Inter, DM_Sans, Newsreader } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const interSans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const newsreaderSerif = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Taut - Microsite & URL Shortener",
  description: "Create beautiful microsites and trackable short links.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/favicon.svg",
    apple: "/logo-mark.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${interSans.variable} ${dmSans.variable} ${newsreaderSerif.variable} font-sans antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
