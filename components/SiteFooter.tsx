"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { footerNav, marketingNav } from "@/lib/nav";
import BrandIcon, { type BrandIconName } from "./BrandIcon";
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

  // A Courses column on every page, whatever Studio's footer holds: most
  // course pages were reachable only through the catalog, so they had a
  // single internal link each. Skipped if an editor already built one.
  const courseLinks = [
    ...(marketingNav.find((n) => n.label === "Courses")?.children?.[0]?.links || []).map((l) => ({
      label: l.label,
      href: l.to
    })),
    { label: "All courses", href: "/courses" }
  ];
  const hasCoursesColumn = columns.some((c) => (c.title || "").trim().toLowerCase() === "courses");
  const allColumns = hasCoursesColumn ? columns : [{ title: "Courses", links: courseLinks }, ...columns];

  const legalLinks = settings?.footerLegalLinks?.length
    ? settings.footerLegalLinks
    : footerNav.legal.map((l) => ({ label: l.label, href: l.to }));

  const social = settings?.social || {};
  const socialItems = (
    [
      { icon: "facebook", href: social.facebook, label: "Facebook" },
      { icon: "twitter", href: social.twitter, label: "Twitter" },
      { icon: "linkedin", href: social.linkedin, label: "LinkedIn" },
      { icon: "instagram", href: social.instagram, label: "Instagram" },
      { icon: "youtube", href: social.youtube, label: "YouTube" }
    ] as Array<{ icon: BrandIconName; href?: string; label: string }>
  ).filter((s): s is { icon: BrandIconName; href: string; label: string } => Boolean(s.href));

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
      <div
        className="t321-mkt-container t321-mkt-footer__inner"
        style={{ "--t321-footer-cols": allColumns.length } as React.CSSProperties}
      >
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
                  <BrandIcon name={s.icon} />
                </a>
              ))}
            </div>
          )}
        </div>

        {allColumns.map((col) => (
          <div key={col.title} className="t321-mkt-footer__col">
            <h3>{col.title}</h3>
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
          <h3>{newsHeading}</h3>
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
