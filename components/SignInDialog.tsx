"use client";

import { useEffect, useRef, useState } from "react";
import "./SignInDialog.css";

type Props = {
  open: boolean;
  onClose: () => void;
  loginUrl: string;
  /** Sign-up page on the learner app — where "Create an account" goes. */
  enrollUrl: string;
  /** Learner app dashboard — where a successful sign-in lands. */
  dashboardUrl: string;
};

type Mode = "signin" | "forgot";

export default function SignInDialog({
  open,
  onClose,
  loginUrl,
  enrollUrl,
  dashboardUrl
}: Props) {
  const emailRef = useRef<HTMLInputElement>(null);
  const forgotEmailRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>("signin");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Credentials go to our own /api/auth/login, which forwards them to the
   * Train321 API and keeps the returned bearer token in an httpOnly cookie.
   * Posting the form straight at the LMS (the old behaviour) left the browser
   * on whatever that host returned — including its 500 page.
   */
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    if (!email || !password) return;

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = (await res.json().catch(() => null)) as
        | { role?: string; fullName?: string; userId?: number; message?: string }
        | null;

      if (!res.ok) {
        setError(data?.message || "Email or password did not match, try again.");
        return;
      }
      // Credentials checked out — hand the learner over to the LMS. Kept as a
      // full page load (not router.push) because the dashboard is a different
      // app on another host.
      window.location.href = dashboardUrl;
    } catch {
      setError("We couldn't reach the sign-in service. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setMode("signin");
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => {
      if (mode === "signin") emailRef.current?.focus();
      else forgotEmailRef.current?.focus();
    }, 60);
    return () => window.clearTimeout(t);
  }, [open, mode]);

  if (!open) return null;

  const forgotAction = `${loginUrl}${loginUrl.includes("?") ? "&" : "?"}forgot=1`;

  return (
    <div
      className="t321-mkt-signin"
      role="dialog"
      aria-modal="true"
      aria-labelledby="t321-signin-title"
      onClick={onClose}
    >
      <div className="t321-mkt-signin__panel" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="t321-mkt-signin__close"
          aria-label={mode === "forgot" ? "Close password reset" : "Close sign in"}
          onClick={onClose}
        >
          <i className="fas fa-times" aria-hidden="true" />
        </button>

        {mode === "signin" ? (
          <>
            <div className="t321-mkt-signin__head">
              <h2 id="t321-signin-title" className="t321-mkt-signin__title">Sign in</h2>
              <p className="t321-mkt-signin__sub">Welcome back. Continue to your Train 321 account.</p>
            </div>

            <form className="t321-mkt-signin__form" onSubmit={onSubmit} noValidate>
              <label className="t321-mkt-signin__field">
                <span className="t321-mkt-signin__label">Email</span>
                <input
                  ref={emailRef}
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="you@company.com"
                  className="t321-mkt-signin__input"
                />
              </label>

              <label className="t321-mkt-signin__field">
                <span className="t321-mkt-signin__label">
                  Password
                  <button
                    type="button"
                    className="t321-mkt-signin__forgot"
                    onClick={() => setMode("forgot")}
                  >
                    Forgot?
                  </button>
                </span>
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  placeholder="Your password"
                  className="t321-mkt-signin__input"
                />
              </label>

              {error && (
                <p className="t321-mkt-signin__error" role="alert">
                  <i className="fas fa-circle-exclamation" aria-hidden="true" /> {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="t321-mkt-btn t321-mkt-btn--primary t321-mkt-signin__submit"
              >
                {submitting ? (
                  <>
                    Signing in <i className="fas fa-spinner fa-spin" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    Sign in <i className="fas fa-arrow-right" aria-hidden="true" />
                  </>
                )}
              </button>
            </form>

            <div className="t321-mkt-signin__divider"><span>or</span></div>

            <a href={loginUrl} className="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-signin__sso">
              Continue to the full sign-in portal
            </a>

            <p className="t321-mkt-signin__foot">
              New to Train 321? <a href={enrollUrl}>Create an account</a>
            </p>
          </>
        ) : (
          <>
            <div className="t321-mkt-signin__head">
              <h2 id="t321-signin-title" className="t321-mkt-signin__title">Reset your password</h2>
              <p className="t321-mkt-signin__sub">
                Enter the email on your account and we'll send a reset link.
              </p>
            </div>

            <form className="t321-mkt-signin__form" method="post" action={forgotAction}>
              <label className="t321-mkt-signin__field">
                <span className="t321-mkt-signin__label">Email</span>
                <input
                  ref={forgotEmailRef}
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  placeholder="you@company.com"
                  className="t321-mkt-signin__input"
                />
              </label>

              <button type="submit" className="t321-mkt-btn t321-mkt-btn--primary t321-mkt-signin__submit">
                Send reset link <i className="fas fa-arrow-right" aria-hidden="true" />
              </button>
            </form>

            <p className="t321-mkt-signin__foot">
              Remembered it?{" "}
              <button
                type="button"
                className="t321-mkt-signin__link-btn"
                onClick={() => setMode("signin")}
              >
                Back to sign in
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
