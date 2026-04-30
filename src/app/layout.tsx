import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import { AppShell } from "@/components/shared/app-shell";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ATLAS Learning",
  description:
    "A focused robotics curriculum with proficiency tracking and spaced practice.",
  icons: {
    icon: "/atlas-logo.png",
    apple: "/atlas-logo.png",
  },
  openGraph: {
    title: "ATLAS Learning",
    description:
      "A focused robotics curriculum with proficiency tracking and spaced practice.",
    images: ["/atlas-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
