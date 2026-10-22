"use client";

import type { CartCourse } from "@/lib/enroll";
import { useV9Cart } from "./V9CartContext";

// Add-to-cart button for the isolated v9 cart (not the shared site cart).
// Adding opens the v9 drawer; a course already in the cart turns the button
// into a way back into the drawer (seat-based team lines re-add to bump seats).
export default function V9AddButton({
  course,
  className
}: {
  course: CartCourse;
  className?: string;
}) {
  const { add, has, openDrawer, buyer } = useV9Cart();
  const inCart = has(course.id);
  const alreadyMaxed = inCart && (!course.isSeatBased || buyer.audience !== "company");

  const onClick = () => {
    if (alreadyMaxed) {
      openDrawer();
      return;
    }
    add(course);
  };

  return (
    <button type="button" className={className} onClick={onClick}>
      {alreadyMaxed ? (
        <><i className="fas fa-check" aria-hidden="true" /> In cart</>
      ) : (
        <><i className="fas fa-cart-plus" aria-hidden="true" /> Add to cart</>
      )}
    </button>
  );
}
