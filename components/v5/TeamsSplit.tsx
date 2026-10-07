"use client";

// Employer section: the pitch on the left, a live-feeling "team dashboard"
// on the right — a progress ring that fills and staff rows that tick in as
// the section scrolls into view. Pure CSS + one in-view flag.

import Link from "next/link";
import { useRef } from "react";
import { Reveal, useInView } from "./motion";

const STAFF = [
  { name: "Maria G.", role: "Server", status: "Certified", tone: "ok" },
  { name: "Devon P.", role: "Bartender", status: "Certified", tone: "ok" },
  { name: "Ana R.", role: "Line cook", status: "In progress · 64%", tone: "warn" },
  { name: "Jordan K.", role: "Host", status: "Certified", tone: "ok" },
  { name: "Sam L.", role: "Manager", status: "Expires in 12 days", tone: "due" }
];

const BULLETS = [
  { icon: "fa-file-invoice-dollar", text: "One invoice for every location — no personal cards, no reimbursements." },
  { icon: "fa-tasks", text: "Assign by role. New hires get the right course the day they start." },
  { icon: "fa-bell", text: "Reminders before anything expires, so the binder is never out of date." },
  { icon: "fa-download", text: "Every certificate in one place, ready for the inspector." }
];

export default function TeamsSplit({ onAudience }: { onAudience: (a: "team") => void }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { threshold: 0.35 });
  const done = 42;
  const total = 48;
  const r = 54;
  const circ = 2 * Math.PI * r;

  return (
    <section className="v5-section v5-teams" aria-labelledby="v5-teams-title">
      <div className="v5-container v5-teams__layout">
        <Reveal className="v5-teams__copy">
          <p className="v5-eyebrow v5-eyebrow--light">
            <i className="fas fa-users" aria-hidden="true" /> For operators
          </p>
          <h2 id="v5-teams-title" className="v5-h2">
            Train the whole team <em>in one afternoon.</em>
          </h2>
          <p className="v5-lede">
            Multi-unit groups, hotels and franchisees run their compliance training on Train 321 because
            it finally takes less time than chasing paper certificates.
          </p>
          <ul className="v5-teams__bullets">
            {BULLETS.map((b) => (
              <li key={b.text}>
                <i className={`fas ${b.icon}`} aria-hidden="true" />
                <span>{b.text}</span>
              </li>
            ))}
          </ul>
          <div className="v5-teams__ctas">
            <Link href="/demo" className="v5-btn v5-btn--accent">
              Book a 15-minute demo <i className="fas fa-arrow-right" aria-hidden="true" />
            </Link>
            <button type="button" className="v5-btn v5-btn--glass" onClick={() => onAudience("team")}>
              See team pricing
            </button>
          </div>
        </Reveal>

        <Reveal className="v5-teams__visual" index={1} variant="scale">
          <div ref={ref} className={`v5-dash${inView ? " is-live" : ""}`} aria-hidden="true">
            <div className="v5-dash__head">
              <span className="v5-dash__brand">
                <i className="fas fa-store" /> Harbor Street Grill · 3 locations
              </span>
              <span className="v5-dash__pill">
                <span className="v5-dot v5-dot--live" /> Live
              </span>
            </div>
            <div className="v5-dash__body">
              <div className="v5-dash__ring">
                <svg viewBox="0 0 140 140">
                  <circle className="v5-dash__track" cx="70" cy="70" r={r} />
                  <circle
                    className="v5-dash__bar"
                    cx="70"
                    cy="70"
                    r={r}
                    style={{ strokeDasharray: circ, strokeDashoffset: inView ? circ * (1 - done / total) : circ }}
                  />
                </svg>
                <div className="v5-dash__ring-label">
                  <strong>
                    {done}
                    <span>/{total}</span>
                  </strong>
                  <span>certified</span>
                </div>
              </div>
              <ul className="v5-dash__rows">
                {STAFF.map((s, i) => (
                  <li key={s.name} style={{ "--v5-i": i } as React.CSSProperties}>
                    <span className="v5-dash__avatar">{s.name[0]}</span>
                    <span className="v5-dash__who">
                      <strong>{s.name}</strong>
                      <span>{s.role}</span>
                    </span>
                    <span className={`v5-dash__status v5-dash__status--${s.tone}`}>{s.status}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="v5-dash__foot">
              <span>
                <i className="fas fa-bolt" /> 6 certificates issued today
              </span>
              <span>
                <i className="fas fa-file-pdf" /> Export for inspection
              </span>
            </div>
          </div>
          <div className="v5-dash__float v5-dash__float--a">
            <i className="fas fa-check-circle" />
            <span>
              <strong>Certificate issued</strong>
              <span>Devon P. · Alcohol Server · just now</span>
            </span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
