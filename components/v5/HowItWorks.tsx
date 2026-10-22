"use client";

import { Reveal } from "./motion";

type Step = { title: string; body: string; icon: string; aside: string };

const SELF: Step[] = [
  {
    title: "Choose your course",
    body: "Pick the food safety, alcohol safety, or workplace training you need for work.",
    icon: "fa-map-marker-alt",
    aside: "2 min"
  },
  {
    title: "Train online",
    body: "Complete your course from your phone or computer with simple, mobile-friendly lessons.",
    icon: "fa-mobile-alt",
    aside: "~1 hr"
  },
  {
    title: "Get your certificate",
    body: "Pass the course and download your certificate when you are done.",
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
            Required training made quick and <em>simple.</em>
          </h2>
          <p className="v5-lede">
            {audience === "team"
              ? "Complete required food safety, alcohol safety, and workplace training online, with mobile-friendly courses your whole team can finish on any device."
              : "Complete required food safety, alcohol safety, and workplace training online with mobile-friendly courses built for busy workers."}
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
