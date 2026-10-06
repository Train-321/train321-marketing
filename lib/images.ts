// Right-sizing for images we don't host ourselves.
//
// Course thumbnails live on the LMS (api.train321.com/uploads/…) at whatever
// size they were uploaded — typically 150–400 KB for a card that renders
// ~340px wide. Sanity images are already resizable through their CDN params.
// Everything else passes through untouched.

// Must stay within next.config's images.remotePatterns.
const OPTIMIZER_HOSTS = new Set([
  "api.train321.com",
  "new-features-api.train321.com",
  // Course hero photos pasted into Studio's "Image URL" field.
  "images.unsplash.com"
]);

// The Next optimizer only accepts widths from its configured size lists.
const ALLOWED_WIDTHS = [256, 384, 640, 750, 828, 1080, 1200];

function snapWidth(w: number): number {
  return ALLOWED_WIDTHS.find((a) => a >= w) ?? ALLOWED_WIDTHS[ALLOWED_WIDTHS.length - 1];
}

/**
 * A URL for `src` rendered about `width` CSS pixels wide (pass the 2x value
 * for the high-density candidate). Returns `src` unchanged when it isn't a
 * host we know how to resize, so callers can use it unconditionally.
 */
export function sizedImage(src: string | null | undefined, width: number): string {
  if (!src) return "";
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return src; // relative path / data URI — already ours, already sized
  }
  if (url.hostname === "cdn.sanity.io") {
    url.searchParams.set("w", String(Math.round(width)));
    if (!url.searchParams.has("auto")) url.searchParams.set("auto", "format");
    return url.toString();
  }
  if (OPTIMIZER_HOSTS.has(url.hostname)) {
    return `/_next/image?url=${encodeURIComponent(src)}&w=${snapWidth(width)}&q=72`;
  }
  return src;
}

/** `srcSet` with 1x and 2x candidates for an image shown `width` px wide. */
export function sizedSrcSet(src: string | null | undefined, width: number): string | undefined {
  if (!src) return undefined;
  const one = sizedImage(src, width);
  const two = sizedImage(src, width * 2);
  if (one === src && two === src) return undefined; // not resizable
  return `${one} 1x, ${two} 2x`;
}
