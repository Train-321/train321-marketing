"use client";

// Hero "wow" for ad visitors, in two parts that talk through window events:
//   - HeroNameBar (left, in place of the old buttons): they type their name;
//     "Get my certificate" takes them to the checkout with it filled in, so
//     the signup has started in the first seconds on the page.
//   - HeroCertificate (right): the certificate they'll earn, with their name
//     filling in live and a gold shine.
// Nothing is sent anywhere: the name only travels to the checkout on this page
// (RbsCheckout listens for RBS_NAME_EVENT).

import { useEffect, useRef, useState } from "react";
import CourseCertificate from "@/components/CourseCertificate";

/** "Get my certificate": the checkout fills in first/last name. */
export const RBS_NAME_EVENT = "rbs:name";
/** Every keystroke in the hero name bar: the hero certificate follows it. */
const RBS_TYPING_EVENT = "rbs:hero-typing";

const tidy = (s: string) => s.trim().replace(/\s+/g, " ");

export function HeroNameBar({ priceLabel }: { priceLabel?: string }) {
  const [name, setName] = useState("");

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    const shown = tidy(name);
    if (shown) window.dispatchEvent(new CustomEvent(RBS_NAME_EVENT, { detail: { name: shown } }));
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("rbs-checkout")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    // id: the phone sticky Enroll bar appears once this has scrolled away.
    <form className="rbs-namebar" id="rbs-hero-cta" onSubmit={go}>
      <label htmlFor="rbs-hero-name" className="rbs-namebar__label">
        <i className="fas fa-wand-magic-sparkles" aria-hidden="true" /> Type your name to see it on your certificate
      </label>
      <div className="rbs-namebar__row">
        <input
          id="rbs-hero-name"
          type="text"
          autoComplete="name"
          placeholder="Your full name"
          maxLength={40}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            window.dispatchEvent(new CustomEvent(RBS_TYPING_EVENT, { detail: { name: tidy(e.target.value) } }));
          }}
        />
        <button type="submit">
          Get my certificate{priceLabel ? ` — ${priceLabel}` : ""} <i className="fas fa-arrow-right" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}

export default function HeroCertificate({ courseTitle, showChipA }: { courseTitle: string; showChipA: boolean }) {
  const [name, setName] = useState("");
  // Bumped when typing pauses, which replays the shine across the certificate.
  const [shine, setShine] = useState(0);
  useEffect(() => {
    const onTyping = (e: Event) => setName(String((e as CustomEvent<{ name?: string }>).detail?.name || ""));
    window.addEventListener(RBS_TYPING_EVENT, onTyping);
    return () => window.removeEventListener(RBS_TYPING_EVENT, onTyping);
  }, []);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = window.setTimeout(() => setShine((n) => n + 1), 220);
    return () => window.clearTimeout(t);
  }, [name]);

  return (
    <div className="rbs-hero__visual">
      <div className="rbs-hero__stage" aria-hidden="true">
        <div className={`rbs-hero__cert${name ? " is-named" : ""}`}>
          <CourseCertificate courseTitle={courseTitle} learnerName={name || "Your Name"} showExpiration={false} />
          {shine > 0 && <span key={shine} className="rbs-hero__shine" />}
        </div>
        {showChipA && (
          <span className="rbs-hero__chip rbs-hero__chip--a">
            <i className="fas fa-paper-plane" /> Reported to ABC within 24 hrs
          </span>
        )}
        <span className="rbs-hero__chip rbs-hero__chip--b">
          <i className="fas fa-download" /> Instant certificate download
        </span>
      </div>
    </div>
  );
}
