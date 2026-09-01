/**
 * Vimeo helpers shared by the pages that embed a player.
 *
 * Editors paste whatever the Vimeo address bar gave them, so nothing
 * downstream should assume a bare id.
 */

/**
 * Pull the numeric video id out of a full Vimeo URL, a /video/<id> player URL,
 * or a bare id typed straight into Studio. Returns "" when there's no id to
 * find, which every caller treats as "no video".
 */
export function vimeoId(input?: string | null): string {
  return String(input || "").match(/(\d{6,})/)?.[1] || "";
}

/**
 * The video's own thumbnail, via Vimeo's public oEmbed endpoint. Only used as
 * a poster of last resort — a course with an image uses that instead. Cached
 * for a day and silently null on any failure, so a Vimeo outage costs the page
 * its poster frame and nothing else.
 */
export async function vimeoThumbnail(id: string): Promise<string | null> {
  if (!id) return null;
  try {
    const res = await fetch(
      `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${id}&width=1200`,
      { next: { revalidate: 86400 } }
    );
    if (!res.ok) return null;
    const data: { thumbnail_url?: string } = await res.json();
    return data.thumbnail_url || null;
  } catch {
    return null;
  }
}
