"use client";

// "Report an issue · or share feedback" — the marketing-site twin of the modal
// on the LMS login screen. Same fields, same issue list, and it posts to the
// same backend endpoint (via /api/report-issue), so a report raised here is
// indistinguishable from one raised inside the app apart from its platform tag.
//
// Modal shell deliberately mirrors SignInDialog: Escape closes, the body stops
// scrolling while open, clicking the backdrop dismisses, and the first field
// takes focus. Two dialogs on the same site should not behave differently.

import { useEffect, useRef, useState } from "react";
import "./ReportIssueDialog.css";

type Props = {
  open: boolean;
  onClose: () => void;
  /** Prefills the name field when we already know who this is. */
  defaultName?: string;
  /** Prefills the email field. */
  defaultEmail?: string;
};

/**
 * Identical to ISSUE_OPTIONS in the LMS's ReportIssueModal.vue. Kept the same
 * on purpose: these values are stored and triaged, so a divergent list here
 * would produce issue types the people reading the reports do not recognise.
 */
const ISSUE_OPTIONS = [
  "Login / Authentication",
  "Course Creation",
  "Course Assignment",
  "Course Playback / SCORM",
  "Lessons / Quizzes",
  "Question Bank",
  "Surveys",
  "Certificates",
  "Employee Management",
  "Company / Branding",
  "Resources",
  "Reports & Analytics",
  "Marketing / Email Templates",
  "Payment / Subscription",
  "Notifications / Alerts",
  "Dashboard",
  "Other"
];

/** Backend rejects anything larger; catch it before paying for the upload. */
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export default function ReportIssueDialog({
  open,
  onClose,
  defaultName = "",
  defaultEmail = ""
}: Props) {
  const nameRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  // Reset on each open so a previous success or error never greets the next
  // person who opens it.
  useEffect(() => {
    if (open) {
      setError(null);
      setSubmitting(false);
      setDone(false);
      const t = window.setTimeout(() => nameRef.current?.focus(), 60);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  if (!open) return null;

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;

    const form = new FormData(e.currentTarget);

    const issueType = String(form.get("issue_type") || "").trim();
    if (!issueType) {
      setError("Please select an issue type.");
      return;
    }
    if (!String(form.get("comments") || "").trim()) {
      setError("Please tell us what happened.");
      return;
    }

    const image = form.get("image");
    if (image instanceof File && image.size > MAX_IMAGE_BYTES) {
      setError("The image must not exceed 8MB.");
      return;
    }
    // An empty file input still submits a zero-byte File; drop it so the
    // backend's image validation is not handed an empty upload.
    if (image instanceof File && image.size === 0) {
      form.delete("image");
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/report-issue", { method: "POST", body: form });
      const data = (await res.json().catch(() => null)) as { message?: string } | null;
      if (!res.ok) {
        setError(data?.message || "We couldn't submit your report. Please try again.");
        return;
      }
      setDone(true);
    } catch {
      setError("We couldn't reach the reporting service. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="t321-mkt-report"
      role="dialog"
      aria-modal="true"
      aria-labelledby="t321-report-title"
      onClick={onClose}
    >
      <div className="t321-mkt-report__panel" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="t321-mkt-report__close"
          aria-label="Close report form"
          onClick={onClose}
        >
          <i className="fas fa-times" aria-hidden="true" />
        </button>

        <div className="t321-mkt-report__head">
          <h2 id="t321-report-title" className="t321-mkt-report__title">
            Report an issue <em>· or share feedback</em>
          </h2>
          <p className="t321-mkt-report__lede">
            Hit a problem or have a suggestion? Let us know — your input helps us serve you better.
          </p>
        </div>

        {done ? (
          <div className="t321-mkt-report__done">
            <i className="fas fa-check-circle" aria-hidden="true" />
            <p>Thanks — your report has been sent. We read every one.</p>
            <button
              type="button"
              className="t321-mkt-btn t321-mkt-btn--primary"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <div className="t321-mkt-report__body">
              <div className="t321-mkt-report__grid">
                <label className="t321-mkt-report__field">
                  <span>Name</span>
                  <input
                    ref={nameRef}
                    name="name"
                    type="text"
                    placeholder="Name"
                    defaultValue={defaultName}
                    autoComplete="name"
                  />
                </label>

                <label className="t321-mkt-report__field">
                  <span>Email</span>
                  <input
                    name="email"
                    type="email"
                    placeholder="Email"
                    defaultValue={defaultEmail}
                    autoComplete="email"
                  />
                </label>

                <label className="t321-mkt-report__field">
                  <span>
                    Select Issue <b aria-hidden="true">*</b>
                  </span>
                  <select name="issue_type" defaultValue="" required>
                    <option value="" disabled>
                      Select Issue
                    </option>
                    {ISSUE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="t321-mkt-report__field">
                  <span>Attach Image (optional)</span>
                  <input
                    name="image"
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                  />
                </label>
              </div>

              <label className="t321-mkt-report__field t321-mkt-report__field--full">
                <span>
                  Comments <b aria-hidden="true">*</b>
                </span>
                <textarea
                  name="comments"
                  rows={5}
                  placeholder="Enter your comments here..."
                  required
                />
              </label>

              {error && (
                <p className="t321-mkt-report__error" role="alert">
                  {error}
                </p>
              )}
            </div>

            <div className="t321-mkt-report__foot">
              <button
                type="button"
                className="t321-mkt-btn t321-mkt-btn--ghost"
                onClick={onClose}
              >
                Close
              </button>
              <button
                type="submit"
                className="t321-mkt-btn t321-mkt-btn--primary"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    Sending <i className="fas fa-spinner fa-spin" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane" aria-hidden="true" /> Submit report
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
