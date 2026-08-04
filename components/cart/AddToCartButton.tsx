"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CartCourse } from "@/lib/enroll";
import { useCart } from "./CartContext";

type Props = {
  course: CartCourse;
  /** "add" drops it in the cart and opens the drawer; "buy" goes to checkout. */
  mode?: "add" | "buy";
  label?: string;
  className?: string;
  showArrow?: boolean;
};

/**
 * The single entry point into the cart from anywhere on the site.
 *
 * "add" is the low-commitment path — the drawer opens so the buyer sees what
 * happened and can keep browsing. "buy" is the express path that skips the
 * drawer entirely and lands on checkout, which is what the old outbound
 * "Enroll now" buttons used to do.
 */
export default function AddToCartButton({
  course,
  mode = "add",
  label,
  className = "t321-mkt-btn t321-mkt-btn--primary",
  showArrow = true
}: Props) {
  const { add, has, openDrawer } = useCart();
  const router = useRouter();
  const [justAdded, setJustAdded] = useState(false);

  const inCart = has(course.id);

  // A compliance course is one seat for the buyer, so once it's in the cart
  // there's nothing to add — the button becomes a way back into the drawer.
  const alreadyMaxed = inCart && !course.isSeatBased;

  const text =
    label ?? (mode === "buy" ? "Enroll now" : alreadyMaxed ? "In cart" : "Add to cart");

  const onClick = () => {
    if (alreadyMaxed && mode === "add") {
      openDrawer();
      return;
    }

    add(course);

    if (mode === "buy") {
      router.push("/checkout");
      return;
    }

    openDrawer();
    // Brief confirmation on the button itself, in case the drawer is dismissed
    // faster than the eye can follow.
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1600);
  };

  return (
    <button type="button" className={className} onClick={onClick}>
      {justAdded ? (
        <>
          <i className="fas fa-check" aria-hidden="true" /> Added
        </>
      ) : (
        <>
          {alreadyMaxed && mode === "add" && (
            <i className="fas fa-check" aria-hidden="true" />
          )}
          {text}
          {showArrow && mode === "buy" && (
            <i className="fas fa-arrow-right" aria-hidden="true" />
          )}
        </>
      )}
    </button>
  );
}
