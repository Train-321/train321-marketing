import { PortableText, type PortableTextComponents } from "next-sanity";
import type { BlogBodyNode } from "@/lib/sanity";

// Renders a blog post's rich body (Portable Text plus the image / videoEmbed /
// callout inserts defined in studio/schemas/objects/blogBody.ts). Server
// component — no state, no handlers.

/** youtube.com/watch?v=…, youtu.be/…, vimeo.com/… → their embed URL.
    Anything else returns null and is treated as a direct video file. */
function toEmbedUrl(raw: string): string | null {
  try {
    const u = new URL(raw);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtube.com" || host === "m.youtube.com") {
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
      const shorts = u.pathname.match(/^\/(?:shorts|embed)\/([\w-]+)/);
      if (shorts) return `https://www.youtube-nocookie.com/embed/${shorts[1]}`;
    }
    if (host === "youtu.be") {
      const id = u.pathname.slice(1).split("/")[0];
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`;
    }
    if (host === "vimeo.com") {
      const id = u.pathname.match(/^\/(\d+)/)?.[1];
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
    if (host === "player.vimeo.com" || host.endsWith("youtube-nocookie.com")) {
      return raw;
    }
  } catch {
    /* not a URL — fall through */
  }
  return null;
}

const components: PortableTextComponents = {
  types: {
    image: ({ value }) => {
      const url = typeof value?.url === "string" ? value.url : null;
      if (!url) return null;
      return (
        <figure className="t321-mkt-prose__media">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`${url}?w=1600&auto=format`} alt={value?.alt || ""} loading="lazy" />
          {value?.caption && <figcaption>{value.caption}</figcaption>}
        </figure>
      );
    },
    videoEmbed: ({ value }) => {
      const url = typeof value?.url === "string" ? value.url : null;
      if (!url) return null;
      const embed = toEmbedUrl(url);
      return (
        <figure className="t321-mkt-prose__media">
          {embed ? (
            <div className="t321-mkt-prose__video-frame">
              <iframe
                src={embed}
                title={value?.caption || "Video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            // eslint-disable-next-line jsx-a11y/media-has-caption
            <video src={url} controls preload="metadata" />
          )}
          {value?.caption && <figcaption>{value.caption}</figcaption>}
        </figure>
      );
    },
    callout: ({ value }) => (
      <aside className="t321-mkt-article__callout">{value?.text || ""}</aside>
    )
  },
  marks: {
    link: ({ value, children }) => {
      const href = typeof value?.href === "string" ? value.href : "#";
      const external = /^https?:\/\//.test(href);
      return (
        <a
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    }
  }
};

export default function BlogPortableText({ value }: { value: BlogBodyNode[] }) {
  if (!value?.length) return null;
  // PortableText's value type is stricter than our pass-through node type;
  // the runtime accepts any typed node and routes it through `components`.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <PortableText value={value as any} components={components} />;
}
