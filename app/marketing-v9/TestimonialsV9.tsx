// Testimonials for /marketing-v9 as a chat/messages thread: a sender name,
// then a bubble with a tail pointing to the avatar, alternating left (received)
// and right (sent) like a real conversation.

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
              <span className="v9t-msg__name"><strong>{t.name}</strong>{who ? ` · ${who}` : ""}</span>
              <blockquote className="v9t-msg__bubble">{t.quote}</blockquote>
            </div>
          </div>
        );
      })}
    </div>
  );
}
