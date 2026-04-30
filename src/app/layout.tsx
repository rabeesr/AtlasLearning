import type { Metadata } from "next";

import { AppShell } from "@/components/shared/app-shell";

import "./globals.css";

export const metadata: Metadata = {
  title: "ATLAS Learning",
  description: "A focused robotics curriculum with proficiency tracking and spaced practice.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
