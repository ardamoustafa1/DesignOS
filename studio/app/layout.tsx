import type { Metadata } from "next";
import { Fraunces, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  variable: "--font-kiln-display",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
  display: "swap",
});

const text = Inter_Tight({
  variable: "--font-kiln-text",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-kiln-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DesignOS Studio — Brief to gated prototype",
  description:
    "Generate an animated Kiln prototype through a central model gateway and reveal it only after the evidence gate passes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-kiln-theme="dark">
      <body className={`${display.variable} ${text.variable} ${mono.variable}`}>
        {children}
      </body>
    </html>
  );
}
