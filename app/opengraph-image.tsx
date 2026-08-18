import { ImageResponse } from "next/og";

// Site-wide social share card (og:image). Rendered once at build; every route
// without its own image inherits it. Blog posts override with their cover
// image via generateMetadata.

export const alt = "Train 321 — Online compliance training";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
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
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 96,
              height: 96,
              borderRadius: 24,
              background: "#00B4DB",
              color: "#0B1F33",
              fontSize: 52,
              fontWeight: 800
            }}
          >
            321
          </div>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 800, letterSpacing: -2 }}>
            TRAIN <span style={{ color: "#00B4DB", marginLeft: 18 }}>321</span>
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 38, marginTop: 48, color: "#cfe9f5" }}>
          Online food safety, alcohol &amp; HR compliance training
        </div>
        <div style={{ display: "flex", fontSize: 28, marginTop: 24, color: "#7fa8bf" }}>
          ANAB-accredited · Instant certificates · train321.com
        </div>
      </div>
    ),
    size
  );
}
