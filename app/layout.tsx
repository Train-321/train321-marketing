import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import { draftMode } from "next/headers";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import DisableDraftMode from "@/components/DisableDraftMode";
import VisualEditingClient from "@/components/VisualEditingClient";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-fraunces",
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    default: "Train321 — Online Food Safety Training",
    template: "%s — Train321"
  },
  description:
    "Online food handler, food manager, and alcohol seller-server training. ANAB-accredited, state-approved.",
  metadataBase: new URL(process.env.SITE_URL || "https://train321-marketing.vercel.app"),
  openGraph: {
    siteName: "Train321",
    type: "website"
  }
};

export const viewport: Viewport = {
  themeColor: "#0b3d91"
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled: isDraft } = await draftMode();
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <head>
        <link rel="icon" type="image/png" href="/img/logos/train321_logo.png" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </head>
      <body>
        <div className="t321-mkt-page">
          <SiteHeader />
          <main id="main" className="t321-mkt-main">
            {children}
          </main>
          <SiteFooter />
        </div>
        {isDraft && (
          <>
            <VisualEditingClient />
            <DisableDraftMode />
          </>
        )}
      </body>
    </html>
  );
}
