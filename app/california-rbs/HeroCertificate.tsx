"use client";

// Hero "wow" for ad visitors, in two parts that talk through window events:
//   - HeroNameBar (left, in place of the old buttons): they type their name;
//     "Get my certificate" takes them to the checkout with it filled in, so
//     the signup has started in the first seconds on the page.
//   - HeroCertificate (right): the certificate they'll earn, with their name
//     filling in live.
// Nothing is sent anywhere: the name only travels to the checkout on this page
// (RbsCheckout listens for RBS_NAME_EVENT).

import { useEffect, useRef, useState } from "react";
import CourseCertificate from "@/components/CourseCertificate";
import { RbsPumpkins } from "./FallTheme";

/** "Get my certificate": the checkout fills in first/last name. */
export const RBS_NAME_EVENT = "rbs:name";
/** Every keystroke in the hero name bar: the hero certificate follows it. */
const RBS_TYPING_EVENT = "rbs:hero-typing";

const tidy = (s: string) => s.trim().replace(/\s+/g, " ");

/**
 * The hero's call to action: just "Get my certificate", which scrolls down to
 * the checkout (the name is entered there). The name-field version is kept
 * below (withName) in case it's wanted back.
 */
export function HeroNameBar({ withName = false }: { withName?: boolean }) {
  const [name, setName] = useState("");

  const go = (e: React.FormEvent) => {
    e.preventDefault();
    const shown = tidy(name);
    if (shown) window.dispatchEvent(new CustomEvent(RBS_NAME_EVENT, { detail: { name: shown } }));
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("rbs-checkout")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  if (!withName) {
    return (
      // id: the phone sticky Enroll bar appears once this has scrolled away.
      <form className="rbs-namebar rbs-namebar--cta" id="rbs-hero-cta" onSubmit={go}>
        <button type="submit">
          Get my certificate <i className="fas fa-arrow-right" aria-hidden="true" />
        </button>
      </form>
    );
  }

  return (
    // id: the phone sticky Enroll bar appears once this has scrolled away.
    <form className="rbs-namebar" id="rbs-hero-cta" onSubmit={go}>
      {/* No visible label (the placeholder says it); kept for screen readers. */}
      <label htmlFor="rbs-hero-name" className="rbs-sr-only">
        Your full name, shown on the certificate
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
          Get my certificate <i className="fas fa-arrow-right" aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}

export default function HeroCertificate({
  courseTitle,
  showChipA,
  fall = false
}: {
  courseTitle: string;
  showChipA: boolean;
  /** Thanksgiving look: a pumpkin pair on the certificate's free bottom-left corner. */
  fall?: boolean;
}) {
  const [name, setName] = useState("");
  useEffect(() => {
    const onTyping = (e: Event) => setName(String((e as CustomEvent<{ name?: string }>).detail?.name || ""));
    window.addEventListener(RBS_TYPING_EVENT, onTyping);
    return () => window.removeEventListener(RBS_TYPING_EVENT, onTyping);
  }, []);
  // Keep the course name on ONE line: shrink it just enough to fit the
  // certificate (long names like "California Responsible Beverage Service
  // (RBS) Training" otherwise wrap or get cut). Re-fits on every resize AND
  // once the certificate's web fonts have loaded — measuring with the
  // narrower fallback font first is what left "…101 te" cut off.
  const certRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = certRef.current;
    if (!box) return;
    const fit = () => {
      const el = box.querySelector<HTMLElement>(".t321-cert__course");
      if (!el) return;
      // Measure at the full size, then shrink only if it doesn't fit.
      el.style.fontSize = "3em";
      const avail = el.clientWidth;
      const need = el.scrollWidth;
      if (avail > 0 && need > avail) el.style.fontSize = `${Math.max(1.2, (3 * avail * 0.96) / need).toFixed(3)}em`;
    };
    fit();
    let alive = true;
    const fonts = document.fonts;
    fonts?.ready.then(() => alive && fit());
    fonts?.addEventListener?.("loadingdone", fit);
    const ro = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(fit);
    ro?.observe(box);
    return () => {
      alive = false;
      fonts?.removeEventListener?.("loadingdone", fit);
      ro?.disconnect();
    };
  }, [courseTitle]);

  return (
    <div className="rbs-hero__visual">
      <div className="rbs-hero__stage" aria-hidden="true">
        <div
          ref={certRef}
          className={`rbs-hero__cert${name ? " is-named" : ""}`}
          // A first guess from the name's length (about 24 characters fit at
          // full size), so it's on one line even before the script measures it.
          style={{ ["--rbs-course-em" as string]: `${Math.min(3, (3 * 24) / Math.max(1, courseTitle.length)).toFixed(3)}em` }}
        >
          <CourseCertificate courseTitle={courseTitle} learnerName={name || "Your Name"} showExpiration={false} />
        </div>
        {showChipA && (
          <span className="rbs-hero__chip rbs-hero__chip--a">
            <i className="fas fa-paper-plane" /> Reported to ABC within 24 hrs
          </span>
        )}
        <span className="rbs-hero__chip rbs-hero__chip--b">
          <i className="fas fa-download" /> Instant certificate download
        </span>
        {fall && <RbsPumpkins className="rbs-fall-patch--cert" />}
      </div>
    </div>
  );
}
