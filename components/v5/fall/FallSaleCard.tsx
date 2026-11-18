"use client";

// Thanksgiving sale strip above the course finder's cards (fall theme only).
// Same offer as the top bar — read live from the THANKSGIVING promo code — so
// it never advertises a code the checkout would reject: hidden when the LMS
// says the code is inactive/expired, or once its end date has passed.

import { useCart } from "@/components/cart/CartContext";
import { FALL, useFallPromo } from "./event";
import { HarvestPumpkin } from "./FallDecor";

export default function FallSaleCard() {
  const { promoCode, applyPromo } = useCart();
  const live = useFallPromo();
  if (live === null) return null;
  const code = live?.code ?? FALL.code;
  const offer = live?.offer ?? FALL.offer;
  const rest = (live?.rest ?? " every course").trim();
  const ends = live?.endsAt ?? Date.parse(FALL.endsAt);
  if (Date.now() >= ends) return null;
  const applied = promoCode.toUpperCase() === code.toUpperCase();

  return (
    <aside className="v5-fa-sale" aria-label="Thanksgiving sale">
      <div className="v5-fa-sale__head">
        <HarvestPumpkin className="v5-fa-sale__icon" />
        <div>
          <p className="v5-fa-sale__title">{FALL.title}</p>
          <p className="v5-fa-sale__deal">
            <strong>{offer}</strong> {rest}
          </p>
        </div>
      </div>
      <div className={`v5-fa-sale__ticket${applied ? " is-applied" : ""}`}>
        <span className="v5-fa-sale__code">{code}</span>
        {applied ? (
          <span className="v5-fa-sale__action v5-fa-sale__action--done" role="status">
            <i className="fas fa-check" aria-hidden="true" /> Applied
          </span>
        ) : (
          <button
            type="button"
            className="v5-fa-sale__action"
            onClick={() => applyPromo(code)}
            aria-label={`Apply code ${code} to your cart`}
          >
            Apply code
          </button>
        )}
      </div>
    </aside>
  );
}
