// Testimonials for /marketing-v9 shown as a chat/messages thread: each review
// is a bubble, alternating sides with an avatar, like a group conversation.

import type { Testimonial } from "@/lib/sanity";

function initials(name: string) {
  return (name || "").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export default function TestimonialsV9({ items }: { items: Testimonial[] }) {
  return (
    <div className="v9t-chat">
      {items.map((t, i) => {
        const who = [t.role, t.company].filter(Boolean).join(" · ");
        return (
          <div key={t.id} className={`v9t-msg${i % 2 ? " is-right" : " is-left"}`}>
            <span className="v9t-msg__avatar" aria-hidden="true">{initials(t.name)}</span>
            <div className="v9t-msg__body">
              <blockquote className="v9t-msg__bubble">{t.quote}</blockquote>
              <p className="v9t-msg__meta">
                <strong>{t.name}</strong>{who ? ` · ${who}` : ""}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
