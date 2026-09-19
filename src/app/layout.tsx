import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppStoreProvider } from "@/state/app-store";
import { AppShell } from "@/components/layout/app-shell";
import { getAppConfig } from "@/lib/config";
import { RuntimeProvider } from "@/state/runtime-context";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "PolicyPulse — how local environmental policy could affect your household",
    template: "%s · PolicyPulse",
  },
  description:
    "Explore environmental policies, compare household costs and plan practical next steps with transparent calculations and source links.",
  applicationName: "PolicyPulse",
  authors: [{ name: "PolicyPulse" }],
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
      "Understand how local environmental policies could affect your household.",
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
        <RuntimeProvider mode={getAppConfig().mode}>
        <AppStoreProvider key={getAppConfig().mode}>
          <AppShell>{children}</AppShell>
        </AppStoreProvider>
        </RuntimeProvider>
      </body>
    </html>
  );
}
