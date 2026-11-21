import type { Metadata } from "next";
import "./globals.css";
import { AnalyticsTracker } from "@/components/analytics-tracker";

export const metadata: Metadata = {
  title: "ZORIX — Comfort. Confidence. Everyday.",
  description: "Discover everyday essentials and considered pieces at ZORIX.",
  metadataBase: new URL("https://zorix.fit")
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body><AnalyticsTracker/>{children}</body>
    </html>
  );
}