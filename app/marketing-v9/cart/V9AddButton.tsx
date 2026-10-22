"use client";

import { useV9Cart, type V9AddInput } from "./V9CartContext";

// Add-to-cart button wired to the isolated v9 cart (not the shared site cart).
export default function V9AddButton({ course, className }: { course: V9AddInput; className?: string }) {
  const { add, has, openDrawer } = useV9Cart();
  const inCart = has(course.id);
  return (
    <button
      type="button"
      className={className}
      onClick={() => (inCart ? openDrawer() : add(course))}
    >
      {inCart ? (
        <><i className="fas fa-check" aria-hidden="true" /> In cart</>
      ) : (
        <><i className="fas fa-cart-plus" aria-hidden="true" /> Add to cart</>
      )}
    </button>
  );
}
