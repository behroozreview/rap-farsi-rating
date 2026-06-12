import type { Metadata } from "next";
import { Anton, Vazirmatn } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const titleFont = Anton({
  variable: "--font-title",
  subsets: ["latin"],
  weight: ["400"],
});

const bodyFont = Vazirmatn({
  variable: "--font-body",
  subsets: ["arabic", "latin"],
});

export const metadata: Metadata = {
  title: "RapFarsi Rating",
  description: "Personal rating archive for RapFarsi tracks",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${titleFont.variable} ${bodyFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
