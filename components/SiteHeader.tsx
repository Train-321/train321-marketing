"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { marketingNav } from "@/lib/nav";
import type { SiteSettings } from "@/lib/sanity";
import SignInDialog from "./SignInDialog";
import CartButton from "./cart/CartButton";
import { useCart } from "./cart/CartContext";
import "./SiteHeader.css";

const APP_BASE = process.env.NEXT_PUBLIC_APP_BASE || "/login";
// The learner app is a hash-routed SPA, so these are hash routes — /login is a
// server path the host answers with an error page instead of the app.
// Matches the fallback getCheckout() builds in lib/enroll.ts.
const LMS_BASE = APP_BASE.replace(/\/+$/, "");
const LOGIN_URL = `${LMS_BASE}/#/login`;
const ENROLL_URL = `${LMS_BASE}/#/enroll`;
/**
 * Fallback destination after sign-in. The normal path is the `redirectUrl`
 * /api/auth/login returns, which carries a one-time SSO code — a bare link to
 * /#/dashboard has no session on the LMS origin and its guard sends the
 * learner to /#/login. For an already-signed-in visitor, link at
 * /api/auth/handoff instead, which mints a code server-side and redirects.
 */
const DASHBOARD_URL = `${LMS_BASE}/#/dashboard`;

type Props = { settings?: SiteSettings };

export default function SiteHeader({ settings }: Props) {
  const phone = settings?.phone || "561-325-7300";
  const email = settings?.email || "info@train321.com";
  const phoneHref = `tel:+1${phone.replace(/\D/g, "")}`;
  const pathname = usePathname();
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerClosing, setDrawerClosing] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  // Keep in sync with the exit animation duration in SiteHeader.css.
  const NAV_DRAWER_EXIT_MS = 220;

  /**
   * Close with a slide-out. The drawer stays mounted with an `is-closing`
   * class until the exit animation finishes — unmounting immediately would
   * make it vanish with no transition.
   */
  const closeNavDrawer = () => {
    setDrawerClosing(true);
    setTimeout(() => {
      setDrawerOpen(false);
      setDrawerClosing(false);
    }, NAV_DRAWER_EXIT_MS);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menus when route changes. Instant (no exit animation) — the page
  // under the drawer has already changed, so a lingering panel looks stale.
  useEffect(() => {
    setDrawerOpen(false);
    setDrawerClosing(false);
    setOpenMenu(null);
  }, [pathname]);

  // The utility link always offers the OPPOSITE of the buyer's current mode:
  // individual mode → "For teams", team mode → "For individuals". Clicking it
  // switches the mode too, so the cart, checkout, and homepage hero follow.
  const { buyer, setAudience } = useCart();
  const audienceLink =
    buyer.audience === "company"
      ? { to: "/individuals", label: "For individuals", audience: "individual" as const }
      : { to: "/", label: "For teams", audience: "company" as const };
  const onAudienceClick = () => {
    // Switching never clears the cart — the items re-quote under the other
    // pricing model while the link navigates to the matching landing page.
    setAudience(audienceLink.audience);
  };

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
            onClick={onAudienceClick}
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
        <div className={`t321-mkt-drawer${drawerClosing ? " is-closing" : ""}`} role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            className="t321-mkt-drawer__scrim"
            aria-label="Close menu"
            onClick={closeNavDrawer}
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
                onClick={closeNavDrawer}
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
                    onClick={closeNavDrawer}
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
                              onClick={closeNavDrawer}
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
                onClick={closeNavDrawer}
              >
                Browse courses <i className="fas fa-arrow-right" aria-hidden="true" />
              </Link>
              <button
                type="button"
                className="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--block"
                onClick={() => {
                  closeNavDrawer();
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
        enrollUrl={ENROLL_URL}
        dashboardUrl={DASHBOARD_URL}
      />
    </header>
  );
}
