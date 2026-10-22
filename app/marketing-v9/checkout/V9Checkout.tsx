"use client";

import { useState } from "react";
import Link from "next/link";
import { useV9Cart } from "../cart/V9CartContext";

const money = (n: number) => `$${n.toFixed(2)}`;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function V9Checkout() {
  const { items, subtotal, count, ready, setQty, remove, clear } = useV9Cart();
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [err, setErr] = useState<{ name?: string; email?: string }>({});
  const [placed, setPlaced] = useState(false);

  const set = (k: "name" | "email" | "phone", v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (err[k as "name" | "email"]) setErr((e) => ({ ...e, [k]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: { name?: string; email?: string } = {};
    if (!form.name.trim()) next.name = "Enter your name";
    if (!EMAIL.test(form.email)) next.email = "Enter a valid email";
    setErr(next);
    if (Object.keys(next).length) return;
    // UI-first: no payment is processed yet. Record the order state and clear
    // the cart. Real Stripe payment gets wired here later.
    setPlaced(true);
    clear();
  };

  const header = (
    <header className="gs-topbar">
      <div className="gs-container gs-topbar__inner">
        <Link href="/marketing-v9" className="gs-topbar__brand" aria-label="Train 321 home">
          <img src="/img/logos/train321_logo.png" alt="Train 321" />
        </Link>
        <Link href="/marketing-v9#courses" className="gs-btn gs-btn--light gs-topbar__cta">
          <i className="fas fa-arrow-left" aria-hidden="true" /> Back to courses
        </Link>
      </div>
    </header>
  );

  return (
    <div className="t321-gs">
      {/* Isolated checkout page: hide the global site header/footer. */}
      <style>{`.t321-mkt-header,.t321-mkt-footer{display:none !important;}`}</style>
      {header}

      {placed ? (
        <section className="v9co v9co--done">
          <div className="v9co__done-card">
            <span className="v9co__done-ic"><i className="fas fa-circle-check" aria-hidden="true" /></span>
            <h1>Order placed</h1>
            <p>Thanks{form.name ? `, ${form.name.split(" ")[0]}` : ""}! We&rsquo;ve got your order. A confirmation and your course access will be sent to <strong>{form.email}</strong>.</p>
            <p className="v9co__done-note">Payment is being set up — nothing has been charged yet.</p>
            <Link href="/marketing-v9#courses" className="gs-btn gs-btn--primary">Browse more courses <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
          </div>
        </section>
      ) : ready && count === 0 ? (
        <section className="v9co v9co--empty">
          <div className="v9co__empty-card">
            <span className="v9co__empty-ic"><i className="fas fa-cart-shopping" aria-hidden="true" /></span>
            <h1>Your cart is empty</h1>
            <p>Add a course to get started.</p>
            <Link href="/marketing-v9#courses" className="gs-btn gs-btn--primary">Browse courses <i className="fas fa-arrow-right" aria-hidden="true" /></Link>
          </div>
        </section>
      ) : (
        <section className="v9co">
          <div className="gs-container">
            <h1 className="v9co__title">Checkout</h1>
            <div className="v9co__grid">
              {/* Buyer details — purchase only, no account signup. */}
              <form className="v9co__form" onSubmit={submit} noValidate>
                <h2>Your details</h2>
                <label className="v9co__field">
                  <span>Full name</span>
                  <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" placeholder="Jordan Lee" />
                  {err.name && <em className="v9co__err">{err.name}</em>}
                </label>
                <label className="v9co__field">
                  <span>Email</span>
                  <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" placeholder="name@company.com" />
                  {err.email && <em className="v9co__err">{err.email}</em>}
                </label>
                <label className="v9co__field">
                  <span>Phone <small>(optional)</small></span>
                  <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" placeholder="561-325-7300" />
                </label>

                <div className="v9co__pay">
                  <span className="v9co__pay-label"><i className="fas fa-lock" aria-hidden="true" /> Payment</span>
                  <p className="v9co__pay-note">Secure card payment is being set up. For now, placing the order reserves your courses — nothing is charged.</p>
                </div>

                <button type="submit" className="gs-btn gs-btn--primary v9co__place">
                  Place order {subtotal > 0 ? `· ${money(subtotal)}` : ""} <i className="fas fa-arrow-right" aria-hidden="true" />
                </button>
              </form>

              {/* Order summary */}
              <aside className="v9co__summary">
                <h2>Order summary</h2>
                <div className="v9co__lines">
                  {items.map((it) => (
                    <div key={it.id} className="v9co__line">
                      <div className="v9co__line-thumb">
                        {it.image ? <img src={it.image} alt="" /> : <i className="fas fa-certificate" aria-hidden="true" />}
                      </div>
                      <div className="v9co__line-meta">
                        <span className="v9co__line-name">{it.name}</span>
                        {it.stateLabel && <span className="v9co__line-state">{it.stateLabel}</span>}
                        <div className="v9co__line-row">
                          <div className="v9d__qty">
                            <button type="button" onClick={() => setQty(it.id, it.qty - 1)} aria-label="Decrease quantity">−</button>
                            <span>{it.qty}</span>
                            <button type="button" onClick={() => setQty(it.id, it.qty + 1)} aria-label="Increase quantity">+</button>
                          </div>
                          <button type="button" className="v9co__line-remove" onClick={() => remove(it.id)}>Remove</button>
                        </div>
                      </div>
                      <span className="v9co__line-price">{money(it.price * it.qty)}</span>
                    </div>
                  ))}
                </div>
                <div className="v9co__totals">
                  <div><span>Subtotal</span><span>{money(subtotal)}</span></div>
                  <div className="v9co__grand"><span>Total</span><strong>{money(subtotal)}</strong></div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
