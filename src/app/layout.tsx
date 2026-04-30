import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";

import { AppShell } from "@/components/shared/app-shell";

import "./globals.css";

const robotoSans = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto-sans",
  weight: ["300", "400", "500", "600", "700", "900"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-roboto-mono",
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
    <html lang="en" className={`${robotoSans.variable} ${robotoMono.variable}`}>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
