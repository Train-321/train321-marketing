"use client";

// Fades the page's sections up as they scroll into view (elements marked
// .rbs-reveal). Progressive: content is only hidden once this script runs
// (it adds .rbs-anim to the page), so nothing stays invisible without JS,
// and visitors who prefer reduced motion get no animation at all.
//
// A plain passive scroll check (a handful of elements) rather than an
// IntersectionObserver: it fires on every scroll in every browser, so a
// section can never get stuck hidden.

import { useEffect } from "react";

export default function RevealOnScroll() {
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.querySelector("main .t321-rbs") || document.querySelector(".t321-rbs");
    if (!root) return;
    let pending = Array.from(root.querySelectorAll<HTMLElement>(".rbs-reveal"));
    if (!pending.length) return;

    const check = () => {
      const line = window.innerHeight * 0.92;
      pending = pending.filter((el) => {
        if (el.getBoundingClientRect().top < line) {
          el.classList.add("is-in");
          return false;
        }
        return true;
      });
      if (!pending.length) stop();
    };
    const stop = () => {
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };

    check(); // anything already on screen shows straight away (no flash)
    root.classList.add("rbs-anim");
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check, { passive: true });
    return stop;
  }, []);
  return null;
}
