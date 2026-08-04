"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { marketingNav } from "@/lib/nav";
import type { SiteSettings } from "@/lib/sanity";
import SignInDialog from "./SignInDialog";
import CartButton from "./cart/CartButton";
import "./SiteHeader.css";

const APP_BASE = process.env.NEXT_PUBLIC_APP_BASE || "/login";
const LOGIN_URL = `${APP_BASE.replace(/\/$/, "")}/login`;

type Props = { settings?: SiteSettings };

export default function SiteHeader({ settings }: Props) {
  const phone = settings?.phone || "561-325-7300";
  const email = settings?.email || "info@train321.com";
  const phoneHref = `tel:+1${phone.replace(/\D/g, "")}`;
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus when route changes
  useEffect(() => {
    setDrawerOpen(false);
    setOpenMenu(null);
  }, [pathname]);

  const audienceLink =
    pathname === "/individuals" ? { to: "/", label: "For teams" } : { to: "/individuals", label: "For individuals" };

  const isActive = (to?: string) => {
    if (!to) return false;
    return pathname === to || pathname?.startsWith(to + "/");
  };

  const toggleMenu = (label: string) => setOpenMenu((v) => (v === label ? null : label));

  return (
    <header className={`t321-mkt-header${scrolled ? " is-scrolled" : ""}`}>
      <a href="#main" className="t321-mkt-header__skip">Skip to main content</a>

      <div className="t321-mkt-header__utility">
        <div className="t321-mkt-container t321-mkt-header__utility-inner">
          <a
            className="t321-mkt-header__util-link"
            href={phoneHref}
            aria-label={`Call ${phone}`}
          >
            <i className="fas fa-phone" aria-hidden="true" />
            <span>{phone}</span>
          </a>
          <a
            className="t321-mkt-header__util-link t321-mkt-header__util-link--secondary"
            href={`mailto:${email}`}
            aria-label={`Email ${email}`}
          >
            <i className="fas fa-envelope" aria-hidden="true" />
            <span>{email}</span>
          </a>
          <span className="t321-mkt-header__util-spacer" aria-hidden="true" />
          <Link
            href={audienceLink.to}
            className="t321-mkt-header__util-link t321-mkt-header__util-link--accent t321-mkt-header__util-link--secondary"
          >
            <i className="fas fa-user-friends" aria-hidden="true" />
            <span>{audienceLink.label}</span>
          </Link>
          <button
            type="button"
            className="t321-mkt-header__util-link t321-mkt-header__util-link--btn"
            aria-label="Sign in"
            onClick={() => setSignInOpen(true)}
          >
            <i className="fas fa-sign-in-alt" aria-hidden="true" />
            <span>Sign in</span>
          </button>
        </div>
      </div>

      <div className="t321-mkt-container t321-mkt-header__bar">
        <Link href="/" className="t321-mkt-brand" aria-label="Train 321 home">
          <Image
            src="/img/logos/train321_logo.png"
            alt="Train321"
            width={272}
            height={154}
            priority
            className="t321-mkt-brand__logo"
          />
        </Link>

        <nav className="t321-mkt-nav" aria-label="Primary">
          <ul className="t321-mkt-nav__list">
            {marketingNav.map((item) => (
              <li
                key={item.label}
                className={`t321-mkt-nav__item${item.children ? " has-children" : ""}${openMenu === item.label ? " is-open" : ""}`}
                onMouseEnter={() => item.children && setOpenMenu(item.label)}
                onMouseLeave={() => item.children && setOpenMenu(null)}
              >
                {!item.children && item.to ? (
                  <Link
                    href={item.to}
                    className={`t321-mkt-nav__link${isActive(item.to) ? " is-active" : ""}`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="t321-mkt-nav__link t321-mkt-nav__link--btn"
                    aria-expanded={openMenu === item.label}
                    onClick={() => toggleMenu(item.label)}
                  >
                    {item.label}
                    <i className="fas fa-chevron-down t321-mkt-nav__caret" aria-hidden="true" />
                  </button>
                )}

                {item.children && (
                  <div className="t321-mkt-nav__menu" role="menu">
                    {item.children.map((group) => (
                      <div key={group.heading} className="t321-mkt-nav__group">
                        <span className="t321-mkt-nav__group-head">{group.heading}</span>
                        {group.links.map((link) => (
                          <Link
                            key={link.to}
                            href={link.to}
                            className="t321-mkt-nav__menu-link"
                            onClick={() => setOpenMenu(null)}
                          >
                            {link.icon && <i className={link.icon} aria-hidden="true" />}
                            <span>{link.label}</span>
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="t321-mkt-header__cta">
          <Link href="/catalog" className="t321-mkt-btn t321-mkt-btn--ghost">Browse courses</Link>
        </div>

        {/* Sits outside __cta because that whole group is hidden below the nav
            breakpoint — the cart has to survive on mobile. Enrollment happens
            on-site now, so this replaced the old outbound "Enroll now" CTA. */}
        <CartButton />

        <button
          type="button"
          className="t321-mkt-header__burger"
          aria-expanded={drawerOpen}
          aria-label="Open navigation"
          onClick={() => setDrawerOpen(true)}
        >
          <i className="fas fa-bars" aria-hidden="true" />
        </button>
      </div>

      {drawerOpen && (
        <div className="t321-mkt-drawer" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            className="t321-mkt-drawer__scrim"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className="t321-mkt-drawer__panel">
            <div className="t321-mkt-drawer__head">
              <Image
                src="/img/logos/train321_logo.png"
                alt="Train321"
                width={200}
                height={114}
                className="t321-mkt-brand__logo t321-mkt-brand__logo--sm"
              />
              <button
                type="button"
                className="t321-mkt-drawer__close"
                aria-label="Close"
                onClick={() => setDrawerOpen(false)}
              >
                <i className="fas fa-times" aria-hidden="true" />
              </button>
            </div>
            <div className="t321-mkt-drawer__body">
              {marketingNav.map((item) =>
                !item.children && item.to ? (
                  <Link
                    key={item.label}
                    href={item.to}
                    className="t321-mkt-drawer__link"
                    onClick={() => setDrawerOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <details key={item.label} className="t321-mkt-drawer__group">
                    <summary className="t321-mkt-drawer__summary">{item.label}</summary>
                    <div className="t321-mkt-drawer__sublist">
                      {item.children?.map((g) => (
                        <div key={g.heading}>
                          <span className="t321-mkt-drawer__subhead">{g.heading}</span>
                          {g.links.map((link) => (
                            <Link
                              key={link.to}
                              href={link.to}
                              className="t321-mkt-drawer__sublink"
                              onClick={() => setDrawerOpen(false)}
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  </details>
                )
              )}
            </div>
            <div className="t321-mkt-drawer__foot">
              {/* "Browse courses" lives in __cta, which is hidden at this
                  breakpoint — so it surfaces here instead. The cart itself is
                  in the header bar, always reachable. */}
              <Link
                href="/catalog"
                className="t321-mkt-btn t321-mkt-btn--primary t321-mkt-btn--block"
                onClick={() => setDrawerOpen(false)}
              >
                Browse courses <i className="fas fa-arrow-right" aria-hidden="true" />
              </Link>
              <button
                type="button"
                className="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--block"
                onClick={() => {
                  setDrawerOpen(false);
                  setSignInOpen(true);
                }}
              >
                Sign in
              </button>
            </div>
          </aside>
        </div>
      )}

      <SignInDialog
        open={signInOpen}
        onClose={() => setSignInOpen(false)}
        loginUrl={LOGIN_URL}
      />
    </header>
  );
}
