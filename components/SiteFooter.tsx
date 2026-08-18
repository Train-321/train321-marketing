"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { footerNav } from "@/lib/nav";
import type { SiteSettings } from "@/lib/sanity";
import "./SiteFooter.css";

type Props = { settings?: SiteSettings };

export default function SiteFooter({ settings }: Props) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const year = new Date().getFullYear();

  const phone = settings?.phone || "561-325-7300";
  const generalEmail = settings?.email || "info@train321.com";
  const phoneHref = `tel:+1${phone.replace(/\D/g, "")}`;

  const tagline =
    settings?.footerTagline ||
    "Compliance training your team will actually finish. Built for restaurants, retailers, and service businesses that need certified staff — without the hassle.";

  // Footer columns: prefer Sanity-driven, fall back to legacy footerNav.
  const columns = settings?.footerColumns?.length
    ? settings.footerColumns
    : [
        { title: "Company", links: footerNav.company.map((l) => ({ label: l.label, href: l.to })) },
        { title: "Support", links: footerNav.support.map((l) => ({ label: l.label, href: l.to })) }
      ];

  const legalLinks = settings?.footerLegalLinks?.length
    ? settings.footerLegalLinks
    : footerNav.legal.map((l) => ({ label: l.label, href: l.to }));

  const social = settings?.social || {};
  const socialItems: Array<{ icon: string; href?: string; label: string }> = [
    { icon: "fab fa-facebook-f", href: social.facebook, label: "Facebook" },
    { icon: "fab fa-twitter", href: social.twitter, label: "Twitter" },
    { icon: "fab fa-linkedin-in", href: social.linkedin, label: "LinkedIn" },
    { icon: "fab fa-instagram", href: social.instagram, label: "Instagram" },
    { icon: "fab fa-youtube", href: social.youtube, label: "YouTube" }
  ].filter((s): s is { icon: string; href: string; label: string } => Boolean(s.href));

  const news = settings?.newsletter || {};
  const newsHeading = news.heading || "Stay in the loop";
  const newsSub =
    news.sub || "Monthly tips on compliance deadlines, state-law changes, and training ROI.";
  const newsPlaceholder = news.placeholder || "you@work.com";
  const newsButton = news.buttonLabel || "Subscribe";
  const newsSuccess = news.successText || "Thanks — you're on the list.";

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
          <Link href="/" className="t321-mkt-footer__logo" aria-label="Train 321 home">
            <Image
              src="/img/logos/train321_logo.png"
              alt={settings?.siteName || "Train 321"}
              width={272}
              height={154}
            />
          </Link>
          <p className="t321-mkt-footer__tagline">{tagline}</p>
          {socialItems.length > 0 && (
            <div className="t321-mkt-footer__social" aria-label="Social">
              {socialItems.map((s) => (
                <a key={s.label} href={s.href} aria-label={s.label} target="_blank" rel="noopener noreferrer">
                  <i className={s.icon} />
                </a>
              ))}
            </div>
          )}
        </div>

        {columns.map((col) => (
          <div key={col.title} className="t321-mkt-footer__col">
            <h4>{col.title}</h4>
            <ul>
              {(col.links || []).map((l) => (
                <li key={`${col.title}-${l.href}`}>
                  <Link href={l.href}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="t321-mkt-footer__col t321-mkt-footer__col--wide">
          <h4>{newsHeading}</h4>
          <p className="t321-mkt-footer__news-sub">{newsSub}</p>
          <form className="t321-mkt-footer__news" onSubmit={onSubscribe}>
            <label className="t321-mkt-footer__news-label" htmlFor="t321-footer-email">Email</label>
            <div className="t321-mkt-footer__news-wrap">
              <i className="fas fa-envelope" aria-hidden="true" />
              <input
                id="t321-footer-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder={newsPlaceholder}
                autoComplete="email"
                required
              />
              <button type="submit" className="t321-mkt-btn t321-mkt-btn--primary">
                {subscribed ? "Subscribed" : newsButton}
              </button>
            </div>
            {subscribed && (
              <p className="t321-mkt-footer__news-ok">
                <i className="fas fa-check-circle" aria-hidden="true" />
                {newsSuccess}
              </p>
            )}
          </form>
          <div className="t321-mkt-footer__contact">
            <a href={phoneHref}>
              <i className="fas fa-phone" aria-hidden="true" /> {phone}
            </a>
            <a href={`mailto:${generalEmail}`}>
              <i className="fas fa-envelope" aria-hidden="true" /> {generalEmail}
            </a>
          </div>
        </div>
      </div>

      <div className="t321-mkt-footer__meta">
        <div className="t321-mkt-container t321-mkt-footer__meta-inner">
          <span>&copy; {year} {settings?.siteName || "Train 321"}. All rights reserved.</span>
          <nav className="t321-mkt-footer__meta-nav" aria-label="Legal">
            {legalLinks.map((l) => (
              <Link key={l.href} href={l.href}>{l.label}</Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
