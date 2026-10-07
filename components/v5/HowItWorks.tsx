"use client";

import { Reveal } from "./motion";

type Step = { title: string; body: string; icon: string; aside: string };

const SELF: Step[] = [
  {
    title: "Pick your state and course",
    body: "Choose where you work and we only show what's accepted there. Food handler, alcohol server, manager, HR — from $10.",
    icon: "fa-map-marker-alt",
    aside: "2 min"
  },
  {
    title: "Train on your phone",
    body: "Short video lessons you can pause between tables. Most courses take about an hour, English or Spanish.",
    icon: "fa-mobile-alt",
    aside: "~1 hr"
  },
  {
    title: "Download your certificate",
    body: "Pass the final and your certificate is ready instantly — print it, save it, or send it straight to your manager.",
    icon: "fa-award",
    aside: "Instant"
  }
];

const TEAM: Step[] = [
  {
    title: "Add your team",
    body: "Upload a list or share a link. Every location on one account, one invoice, seats you can reassign.",
    icon: "fa-users",
    aside: "5 min"
  },
  {
    title: "They train, you track",
    body: "Staff finish on their phones. Your dashboard shows who's certified, who's in progress, and who needs a nudge.",
    icon: "fa-chart-line",
    aside: "Same day"
  },
  {
    title: "Stay inspection-ready",
    body: "Certificates file themselves. We remind you before anything expires, so the binder is never out of date.",
    icon: "fa-shield-alt",
    aside: "Always"
  }
];

export default function HowItWorks({ audience }: { audience: "self" | "team" }) {
  const steps = audience === "team" ? TEAM : SELF;
  return (
    <section className="v5-section v5-how" aria-labelledby="v5-how-title">
      <div className="v5-container">
        <Reveal className="v5-head v5-head--center">
          <p className="v5-eyebrow">
            <i className="fas fa-bolt" aria-hidden="true" /> How it works
          </p>
          <h2 id="v5-how-title" className="v5-h2">
            Tap. Train. <em>Done.</em>
          </h2>
          <p className="v5-lede">
            {audience === "team"
              ? "No onboarding call, no setup fee. Most teams are fully certified the week they sign up."
              : "No classroom, no waiting on anyone. Most people finish before their next shift."}
          </p>
        </Reveal>
        <ol className="v5-how__grid">
          {steps.map((s, i) => (
            <Reveal as="li" key={s.title} index={i} className="v5-how__step">
              <span className="v5-how__num" aria-hidden="true">
                0{i + 1}
              </span>
              <span className="v5-how__icon" aria-hidden="true">
                <i className={`fas ${s.icon}`} />
              </span>
              <span className="v5-how__aside">{s.aside}</span>
              <h3 className="v5-h3">{s.title}</h3>
              <p>{s.body}</p>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
