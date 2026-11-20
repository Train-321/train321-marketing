"use client";

// Phones only (hidden by CSS on wider screens): a slim "Enroll now" bar pinned
// to the bottom of the screen. It shows only while no other way to enroll is
// on screen: it steps aside for the hero name bar, the checkout itself and
// the page's other Enroll buttons (how-it-works, closing banner) — so there
// are never two Enroll buttons visible at once, and it never covers the form.

import { useEffect, useState } from "react";

const TARGETS = ["#rbs-hero-cta", "#rbs-checkout", ".rbs-how__foot", ".rbs-closer .rbs-btn"];

export default function StickyEnroll({ label }: { label: string }) {
  // Start hidden until the observer has reported (the hero is on screen at load).
  const [otherVisible, setOtherVisible] = useState(true);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    // Every match is watched (a copy that is never on screen just never counts).
    const els = TARGETS.flatMap((s) => Array.from(document.querySelectorAll<HTMLElement>(s)));
    if (!els.length) return;
    const onScreen = new Set<Element>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) onScreen.add(e.target);
        else onScreen.delete(e.target);
      }
      setOtherVisible(onScreen.size > 0);
    });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const show = !otherVisible;
  return (
    <div className={`rbs-sticky${show ? " is-shown" : ""}`} aria-hidden={!show}>
      <a href="#rbs-checkout" className="rbs-btn rbs-btn--pay" tabIndex={show ? 0 : -1}>
        {label} <i className="fas fa-arrow-right" aria-hidden="true" />
      </a>
    </div>
  );
}
