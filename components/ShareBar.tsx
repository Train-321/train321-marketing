"use client";

import { useEffect, useState } from "react";
import BrandIcon from "./BrandIcon";

// Share buttons for an article. Every link carries the full article URL —
// the previous bar tweeted only the title and sent LinkedIn nothing at all —
// and "Copy link" really copies. On phones with a native share sheet (which
// covers Messages, WhatsApp, Mail, etc.) an extra Share button opens it.

type Props = {
  url: string;
  title: string;
  /** Short line under the subject in the email body. */
  summary?: string;
  label: string;
};

export default function ShareBar({ url, title, summary, label }: Props) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  const mailBody = encodeURIComponent(`${summary ? summary + "\n\n" : ""}${url}`);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked (e.g. insecure context) — fall back to the prompt.
      window.prompt("Copy this link", url);
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, text: summary, url });
    } catch {
      // User dismissed the sheet — nothing to do.
    }
  }

  return (
    <aside className="t321-mkt-article__share" aria-label={label}>
      <span>{label}</span>
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${u}`}
        target="_blank"
        rel="noopener"
        aria-label="Share on LinkedIn"
        title="LinkedIn"
      >
        <BrandIcon name="linkedin" />
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${u}`}
        target="_blank"
        rel="noopener"
        aria-label="Share on Facebook"
        title="Facebook"
      >
        <BrandIcon name="facebook" />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${u}&text=${t}`}
        target="_blank"
        rel="noopener"
        aria-label="Share on X"
        title="X"
      >
        <BrandIcon name="twitter" />
      </a>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`}
        target="_blank"
        rel="noopener"
        aria-label="Share on WhatsApp"
        title="WhatsApp"
      >
        <BrandIcon name="whatsapp" />
      </a>
      <a href={`mailto:?subject=${t}&body=${mailBody}`} aria-label="Share by email" title="Email">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      </a>
      <button type="button" onClick={copy} aria-label={copied ? "Link copied" : "Copy link"} title={copied ? "Copied" : "Copy link"} aria-live="polite">
        {copied ? (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m5 12 5 5L20 7" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
            <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
          </svg>
        )}
      </button>
      {canNativeShare && (
        <button type="button" onClick={nativeShare} aria-label="Share…" title="Share…">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3v12" />
            <path d="m7 8 5-5 5 5" />
            <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
          </svg>
        </button>
      )}
    </aside>
  );
}
