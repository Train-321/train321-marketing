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
import { SanityLive, getSiteSettings } from "@/lib/sanity";
import { GoogleAnalytics } from "@next/third-parties/google";
import JsonLd from "@/components/JsonLd";
import { ORGANIZATION_LD } from "@/lib/seo";
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

// Code defaults for the site-wide title/description. Studio's Site Settings →
// "Search & social sharing" overrides them when filled in; these only show
// while those fields are empty (or if Sanity is unreachable).
const DEFAULT_SITE_TITLE = "Online Food Handler, Alcohol & Compliance Training for Restaurants | Train 321";
const DEFAULT_SITE_DESCRIPTION =
  "Online food handler, food manager, and alcohol seller-server training. ANAB-accredited, state-approved.";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const seo = settings.defaultSeo;
  const siteName = settings.siteName || "Train 321";
  return {
    title: {
      default: seo?.metaTitle || DEFAULT_SITE_TITLE,
      // "|" rather than an em dash: matches the approved title list, and
      // lib/seo.ts TITLE_SUFFIX counts the same 12 characters.
      template: `%s | ${siteName}`
    },
    description: seo?.metaDescription || DEFAULT_SITE_DESCRIPTION,
    metadataBase: new URL(process.env.SITE_URL || "https://train321-marketing.vercel.app"),
    // The share image itself comes from app/opengraph-image.tsx, which uses
    // the Studio share image when one is set and draws the default card
    // otherwise. File-based images beat anything declared here, so it is
    // deliberately not repeated.
    openGraph: {
      siteName,
      type: "website"
    },
    twitter: {
      card: "summary_large_image"
    },
    // Proves ownership of www.train321.com to Google Search Console. Google
    // re-checks periodically, so this has to stay put after verification.
    verification: {
      google: "Nfaulb5Oqkq4Bu-Y0KcOXafksELW3wNovEkAvL5Vioo"
    }
    // NOTE: no `alternates.canonical` here. A layout-level canonical is
    // inherited by every child page, which pointed the whole site's canonical
    // at the homepage — Google was told to ignore every subpage. Each page
    // declares its own canonical instead.
  };
}

export const viewport: Viewport = {
  themeColor: "#0B1F33"
};

// Google Analytics 4. Set only in production on Vercel, so preview
// deployments and local dev never pollute the property's data.
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

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
        {/* Course thumbnails come from the LMS — warm the connection so
            SkeletonImage shimmer windows stay short. */}
        <link rel="preconnect" href="https://api.train321.com" crossOrigin="anonymous" />

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
        {/* Sitewide Organization schema — course/blog/FAQ pages reference it. */}
        <JsonLd data={ORGANIZATION_LD} />
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
        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
      </body>
    </html>
  );
}
