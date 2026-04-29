import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "ATLAS",
  description: "A learning OS scaffold for deep technical self-study.",
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
