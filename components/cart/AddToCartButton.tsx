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
 * "add" is the low-commitment path — a bottom-center toast confirms the add
 * while the buyer keeps browsing (the drawer only opens when they ask for
 * it). "buy" is the express path that skips confirmation entirely and lands
 * on checkout, which is what the old outbound "Enroll now" buttons used to do.
 */
export default function AddToCartButton({
  course,
  mode = "add",
  label,
  className = "t321-mkt-btn t321-mkt-btn--primary",
  showArrow = true
}: Props) {
  const { add, has, openDrawer, notifyAdded, buyer } = useCart();
  const router = useRouter();
  const [justAdded, setJustAdded] = useState(false);

  const inCart = has(course.id);

  // Once in the cart there's usually nothing more to add — the button becomes
  // a way back into the drawer. The exception is a seat-based course in TEAM
  // mode, where re-adding bumps the seat count; individuals always buy
  // exactly one seat of everything.
  const alreadyMaxed =
    inCart && (!course.isSeatBased || buyer.audience !== "company");

  const text =
    label ?? (mode === "buy" ? "Enroll now" : alreadyMaxed ? "In cart" : "Add to cart");

  const onClick = () => {
    if (alreadyMaxed && mode === "add") {
      // Nothing more to add — clicking "In cart" is a request to SEE the
      // cart, so this stays a drawer-opener.
      openDrawer();
      return;
    }

    add(course);

    if (mode === "buy") {
      router.push("/checkout");
      return;
    }

    // Confirm without interrupting: toast at the bottom, plus a brief state
    // change on the button itself for eyes that never leave it.
    notifyAdded(course.name);
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
          {/* Leading icon tells the story at a glance: check = already in the
              cart, cart-plus = will be added. Buy mode keeps its arrow. */}
          {mode === "add" &&
            (alreadyMaxed ? (
              <i className="fas fa-check" aria-hidden="true" />
            ) : (
              <i className="fas fa-cart-plus" aria-hidden="true" />
            ))}
          {text}
          {showArrow && mode === "buy" && (
            <i className="fas fa-arrow-right" aria-hidden="true" />
          )}
        </>
      )}
    </button>
  );
}
