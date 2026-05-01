"use client";

import { useEffect, useRef, useState } from "react";
import "./SignInDialog.css";

type Props = {
  open: boolean;
  onClose: () => void;
  loginUrl: string;
};

type Mode = "signin" | "forgot";

export default function SignInDialog({ open, onClose, loginUrl }: Props) {
  const emailRef = useRef<HTMLInputElement>(null);
  const forgotEmailRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>("signin");

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
    if (open) setMode("signin");
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

            <form className="t321-mkt-signin__form" method="post" action={loginUrl}>
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

              <button type="submit" className="t321-mkt-btn t321-mkt-btn--primary t321-mkt-signin__submit">
                Sign in <i className="fas fa-arrow-right" aria-hidden="true" />
              </button>
            </form>

            <div className="t321-mkt-signin__divider"><span>or</span></div>

            <a href={loginUrl} className="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-signin__sso">
              Continue to the full sign-in portal
            </a>

            <p className="t321-mkt-signin__foot">
              New to Train 321? <a href="/enroll">Create an account</a>
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
