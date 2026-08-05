import type { Metadata, Viewport } from "next";
import { Inter, Fraunces, Montserrat } from "next/font/google";
import { draftMode } from "next/headers";
import dynamic from "next/dynamic";
import SiteHeader from "@/components/SiteHeaderShell";
import SiteFooter from "@/components/SiteFooterShell";
import ChatWidget from "@/components/ChatWidgetShell";
import DisableDraftMode from "@/components/DisableDraftMode";
import { CartProvider } from "@/components/cart/CartContext";
import CartDrawer from "@/components/cart/CartDrawer";
import CartToast from "@/components/cart/CartToast";
import { SanityLive } from "@/lib/sanity";
import "./globals.css";

// Lazy-load visual editing — only pulled into the bundle when draft mode is on.
// Saves ~120 KiB on the main JS bundle for the 99% of visitors who aren't editors.
const VisualEditingClient = dynamic(() => import("@/components/VisualEditingClient"));

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
// Certificate preview only — matches the font used by the issued PDF.
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-montserrat",
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
  themeColor: "#0B1F33"
};

const FA_HREF =
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEnabled: isDraft } = await draftMode();
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${montserrat.variable}`}>
      <head>
        {/* Connection warmup for the two third-party origins we always hit. */}
        <link rel="preconnect" href="https://cdn.sanity.io" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />

        <link rel="icon" type="image/png" href="/img/logos/train321_logo.png" />

        {/*
          Font Awesome — non-render-blocking load.
          Loaded with media="print" so the browser fetches without blocking
          first paint. Inline script flips it to media="all" once the
          stylesheet has finished downloading. <noscript> fallback keeps
          icons visible if JS is disabled.
        */}
        <link rel="preload" href={FA_HREF} as="style" fetchPriority="high" />
        {/* suppressHydrationWarning: the inline script below flips media to
            "all" before React hydrates, which is expected — not a bug. */}
        <link rel="stylesheet" href={FA_HREF} media="print" id="t321-fa" suppressHydrationWarning />
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var l=document.getElementById('t321-fa');if(!l)return;var swap=function(){l.media='all'};if(l.sheet){swap()}else{l.addEventListener('load',swap,{once:true})}})();"
          }}
        />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-css-tags */}
          <link rel="stylesheet" href={FA_HREF} />
        </noscript>
      </head>
      <body>
        {/* Wraps everything so the cart survives client-side navigation and the
            drawer can be opened from any page. */}
        <CartProvider>
          <div className="t321-mkt-page">
            <SiteHeader />
            <main id="main" className="t321-mkt-main">
              {children}
            </main>
            <SiteFooter />
          </div>
          {/* Trigger lives in SiteHeader's nav; this is just the panel. */}
          <CartDrawer />
          {/* Bottom-center "Added to cart" confirmation. */}
          <CartToast />
        </CartProvider>
        <ChatWidget />
        {isDraft && (
          <>
            <SanityLive />
            <VisualEditingClient />
            <DisableDraftMode />
          </>
        )}
      </body>
    </html>
  );
}
