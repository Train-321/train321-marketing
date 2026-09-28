import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { sanityClient, urlFor, DEFAULT_SEO_PROJ, type DefaultSeo } from "@/lib/sanity";

// Site-wide social share card (og:image). Every route without its own image
// inherits it; blog posts override with their cover image via generateMetadata.
//
// Editors can replace the drawn card from Studio: Site Settings → "Search &
// social sharing" → share image. When that is set we serve it (cropped to
// 1200×630 through the Sanity image CDN, honouring the hotspot); otherwise
// we draw the default card below.

export const alt = "Train 321 — Online compliance training";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Re-check Studio every minute, same window as the rest of the site's Sanity
// reads. (Not sanityFetch: that needs draft mode, which would make this route
// fully dynamic; a published-only read is all a share card needs.)
export const revalidate = 60;

async function studioShareImage(): Promise<Response | null> {
  try {
    const seo = await sanityClient.fetch<DefaultSeo | null>(
      `*[_id == "siteSettings"][0].${DEFAULT_SEO_PROJ}`,
      {},
      { next: { revalidate: 60 } }
    );
    if (!seo?.ogImage) return null;
    const url = urlFor(seo.ogImage)
      .width(size.width)
      .height(size.height)
      .fit("crop")
      .format("png")
      .url();
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return new Response(await res.arrayBuffer(), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=0, s-maxage=60, stale-while-revalidate=600"
      }
    });
  } catch {
    // Sanity down or misconfigured — fall through to the drawn card rather
    // than breaking every link preview.
    return null;
  }
}

export default async function OgImage() {
  const fromStudio = await studioShareImage();
  if (fromStudio) return fromStudio;

  // The real logo, inlined as a data URI — satori can't fetch relative URLs.
  // It carries navy elements that disappear on the navy background, so it
  // sits on a white panel.
  const logo = await readFile(
    join(process.cwd(), "public", "img", "logos", "train321_logo.png")
  );
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0B1F33 0%, #12314e 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            alignSelf: "flex-start",
            background: "#ffffff",
            borderRadius: 28,
            padding: "36px 48px",
            boxShadow: "0 12px 40px rgba(0,0,0,0.35)"
          }}
        >
          {/* 1453×837 source — rendered at 380×219 keeps the aspect ratio. */}
          <img src={logoSrc} width={380} height={219} alt="" />
        </div>
        <div style={{ display: "flex", fontSize: 40, marginTop: 52, color: "#e9f6fc", fontWeight: 700 }}>
          Online food safety, alcohol &amp; HR compliance training
        </div>
        <div style={{ display: "flex", fontSize: 28, marginTop: 20, color: "#8fb3c9" }}>
          ANAB-accredited · Instant certificates · train321.com
        </div>
      </div>
    ),
    size
  );
}
