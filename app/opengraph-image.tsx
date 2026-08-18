import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Site-wide social share card (og:image). Rendered once at build; every route
// without its own image inherits it. Blog posts override with their cover
// image via generateMetadata.

export const alt = "Train 321 — Online compliance training";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
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
