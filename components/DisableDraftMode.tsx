"use client";

// Tiny floating control rendered only when Next.js draft mode is on.
// Lets editors quickly exit the preview session.

export default function DisableDraftMode() {
  return (
    <a
      href="/api/disable-draft"
      style={{
        position: "fixed",
        bottom: 12,
        left: 12,
        zIndex: 9999,
        padding: "6px 10px",
        background: "#0b3d91",
        color: "#fff",
        borderRadius: 6,
        font: "500 12px/1 system-ui, sans-serif",
        textDecoration: "none",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
      }}
    >
      Exit preview
    </a>
  );
}
