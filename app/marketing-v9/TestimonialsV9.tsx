// Testimonials for /marketing-v9 as floating comment cards: a uniform card
// (avatar, name, stars, text) per review, alternating left/right for rhythm.

import type { Testimonial } from "@/lib/sanity";

function initials(name: string) {
  return (name || "").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export default function TestimonialsV9({ items }: { items: Testimonial[] }) {
  return (
    <div className="v9t-comments">
      {items.map((t, i) => {
        const who = [t.role, t.company].filter(Boolean).join(" · ");
        return (
          <div key={t.id} className={`v9t-comment${i % 2 ? " is-right" : " is-left"}`}>
            <div className="v9t-comment__head">
              <span className="v9t-comment__avatar" aria-hidden="true">{initials(t.name)}</span>
              <span className="v9t-comment__who">
                <strong>{t.name}</strong>
                {who && <span>{who}</span>}
              </span>
              <span className="v9t-comment__stars" aria-hidden="true">★★★★★</span>
            </div>
            <p className="v9t-comment__text">{t.quote}</p>
          </div>
        );
      })}
    </div>
  );
}
