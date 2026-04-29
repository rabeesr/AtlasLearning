import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "ATLAS Learning OS",
  description: "A learner-facing operating system for deep technical study with a separate internal workbench.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
