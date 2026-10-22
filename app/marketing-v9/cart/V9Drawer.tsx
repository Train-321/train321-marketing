"use client";

import Link from "next/link";
import { useV9Cart } from "./V9CartContext";

const money = (n: number) => `$${n.toFixed(2)}`;

// Isolated slide-out cart drawer for /marketing-v9.
export default function V9Drawer() {
  const { items, subtotal, count, drawerOpen, closeDrawer, remove, setQty } = useV9Cart();

  return (
    <div className={`v9d${drawerOpen ? " is-open" : ""}`}>
      <div className="v9d__overlay" onClick={closeDrawer} aria-hidden="true" />
      <aside className="v9d__panel" role="dialog" aria-modal="true" aria-label="Your cart">
        <div className="v9d__head">
          <h2>Your cart{count > 0 ? ` (${count})` : ""}</h2>
          <button type="button" className="v9d__close" onClick={closeDrawer} aria-label="Close cart">
            <i className="fas fa-xmark" aria-hidden="true" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="v9d__empty">
            <i className="fas fa-cart-shopping" aria-hidden="true" />
            <p>Your cart is empty.</p>
            <button type="button" className="gs-btn gs-btn--light" onClick={closeDrawer}>Browse courses</button>
          </div>
        ) : (
          <>
            <div className="v9d__items">
              {items.map((it) => (
                <div key={it.id} className="v9d__item">
                  <div className="v9d__thumb">
                    {it.image ? <img src={it.image} alt="" /> : <i className="fas fa-certificate" aria-hidden="true" />}
                  </div>
                  <div className="v9d__meta">
                    <span className="v9d__name">{it.name}</span>
                    {it.stateLabel && <span className="v9d__state">{it.stateLabel}</span>}
                    <div className="v9d__row">
                      <div className="v9d__qty">
                        <button type="button" onClick={() => setQty(it.id, it.qty - 1)} aria-label="Decrease quantity">−</button>
                        <span>{it.qty}</span>
                        <button type="button" onClick={() => setQty(it.id, it.qty + 1)} aria-label="Increase quantity">+</button>
                      </div>
                      <span className="v9d__price">{money(it.price * it.qty)}</span>
                    </div>
                  </div>
                  <button type="button" className="v9d__remove" onClick={() => remove(it.id)} aria-label={`Remove ${it.name}`}>
                    <i className="fas fa-trash-can" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>

            <div className="v9d__foot">
              <div className="v9d__total"><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
              <Link href="/marketing-v9/checkout" className="gs-btn gs-btn--primary v9d__checkout" onClick={closeDrawer}>
                Checkout <i className="fas fa-arrow-right" aria-hidden="true" />
              </Link>
              <p className="v9d__note"><i className="fas fa-lock" aria-hidden="true" /> Secure checkout</p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
