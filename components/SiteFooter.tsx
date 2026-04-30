"use client";

import Link from "next/link";
import { useState } from "react";
import { footerNav } from "@/lib/nav";
import "./SiteFooter.css";

export default function SiteFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const year = new Date().getFullYear();

  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
    setTimeout(() => {
      setSubscribed(false);
      setEmail("");
    }, 2500);
  };

  return (
    <footer className="t321-mkt-footer">
      <div className="t321-mkt-container t321-mkt-footer__inner">
        <div className="t321-mkt-footer__brand">
          <Link href="/" className="t321-mkt-brand t321-mkt-brand--dark">
            <span className="t321-mkt-brand__mark" aria-hidden="true">
              <i className="fas fa-graduation-cap" />
            </span>
            <span className="t321-mkt-brand__word">
              Train<span className="t321-mkt-brand__accent">321</span>
            </span>
          </Link>
          <p className="t321-mkt-footer__tagline">
            Compliance training your team will actually finish. Built for restaurants, retailers,
            and service businesses that need certified staff — without the hassle.
          </p>
          <div className="t321-mkt-footer__social" aria-label="Social">
            <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook-f" /></a>
            <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noopener noreferrer"><i className="fab fa-twitter" /></a>
            <a href="https://linkedin.com" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer"><i className="fab fa-linkedin-in" /></a>
            <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram" /></a>
            <a href="https://youtube.com" aria-label="YouTube" target="_blank" rel="noopener noreferrer"><i className="fab fa-youtube" /></a>
          </div>
        </div>

        <div className="t321-mkt-footer__col">
          <h4>Company</h4>
          <ul>
            {footerNav.company.map((l) => (
              <li key={l.to}>
                <Link href={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="t321-mkt-footer__col">
          <h4>Support</h4>
          <ul>
            {footerNav.support.map((l) => (
              <li key={l.to}>
                <Link href={l.to}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="t321-mkt-footer__col t321-mkt-footer__col--wide">
          <h4>Stay in the loop</h4>
          <p className="t321-mkt-footer__news-sub">
            Monthly tips on compliance deadlines, state-law changes, and training ROI.
          </p>
          <form className="t321-mkt-footer__news" onSubmit={onSubscribe}>
            <label className="t321-mkt-footer__news-label" htmlFor="t321-footer-email">Email</label>
            <div className="t321-mkt-footer__news-wrap">
              <i className="fas fa-envelope" aria-hidden="true" />
              <input
                id="t321-footer-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@work.com"
                autoComplete="email"
                required
              />
              <button type="submit" className="t321-mkt-btn t321-mkt-btn--primary">
                {subscribed ? "Subscribed" : "Subscribe"}
              </button>
            </div>
            {subscribed && (
              <p className="t321-mkt-footer__news-ok">
                <i className="fas fa-check-circle" aria-hidden="true" />
                Thanks — you&apos;re on the list.
              </p>
            )}
          </form>
          <div className="t321-mkt-footer__contact">
            <a href="tel:+15613257300"><i className="fas fa-phone" aria-hidden="true" /> 561-325-7300</a>
            <a href="mailto:info@train321.com"><i className="fas fa-envelope" aria-hidden="true" /> info@train321.com</a>
          </div>
        </div>
      </div>

      <div className="t321-mkt-footer__meta">
        <div className="t321-mkt-container t321-mkt-footer__meta-inner">
          <span>&copy; {year} Train321. All rights reserved.</span>
          <nav className="t321-mkt-footer__meta-nav" aria-label="Legal">
            {footerNav.legal.map((l) => (
              <Link key={l.to} href={l.to}>{l.label}</Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
