import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppStoreProvider } from "@/state/app-store";
import { AppShell } from "@/components/layout/app-shell";

export const metadata: Metadata = {
  title: {
    default: "PolicyPulse — how local environmental policy could affect your household",
    template: "%s · PolicyPulse",
  },
  description:
    "PolicyPulse helps you understand how local environmental policies could affect your household, your neighbourhood and your daily habits — and what you can do next. Demonstration build with illustrative data.",
  applicationName: "PolicyPulse",
  authors: [{ name: "PolicyPulse hackathon team" }],
  keywords: [
    "environmental policy",
    "waste reduction",
    "recycling",
    "composting",
    "civic technology",
  ],
  robots: { index: false, follow: false },
  openGraph: {
    title: "PolicyPulse",
    description:
      "Understand how local environmental policies could affect your household. Demonstration build with illustrative data.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#faf7f0",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AppStoreProvider>
          <AppShell>{children}</AppShell>
        </AppStoreProvider>
      </body>
    </html>
  );
}
