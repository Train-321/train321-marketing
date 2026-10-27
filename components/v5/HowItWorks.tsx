"use client";

import type { AudienceCopyDoc, SectionHead } from "@/lib/sanity";
import { Reveal } from "./motion";
import AccentLast from "./AccentLast";

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
    title: "Choose your training",
    body: "Select the courses your team needs for food safety, alcohol safety, or workplace compliance.",
    icon: "fa-tasks",
    aside: "2 min"
  },
  {
    title: "Create your account",
    body: "Sign up, add your team, and assign courses from one simple platform.",
    icon: "fa-users",
    aside: "5 min"
  },
  {
    title: "Track completions",
    body: "Monitor progress, view certificates, and keep training records organized in one dashboard.",
    icon: "fa-chart-line",
    aside: "Same day"
  }
];

const LEDE = {
  self: "Complete required food safety, alcohol safety, and workplace training online with mobile-friendly courses built for busy workers.",
  team: "Assign courses in minutes. Employees complete training on their phones, and you can track progress without chasing paperwork."
};

export default function HowItWorks({
  audience,
  head,
  studio
}: {
  audience: "self" | "team";
  head?: SectionHead;
  studio?: AudienceCopyDoc;
}) {
  // Titles and bodies come from Studio when set; the icon and time chip stay
  // with each step's position, so editors only ever write words.
  const base = audience === "team" ? TEAM : SELF;
  const steps = studio?.steps?.length
    ? studio.steps.map((s, i) => ({
        ...(base[i] || base[base.length - 1]),
        title: s.title || "",
        body: s.body || ""
      }))
    : base;
  return (
    <section className="v5-section v5-how" aria-labelledby="v5-how-title">
      <div className="v5-container">
        <Reveal className="v5-head v5-head--center">
          <p className="v5-eyebrow">
            <i className={head?.icon || "fas fa-bolt"} aria-hidden="true" /> {head?.eyebrow || "How it works"}
          </p>
          <h2 id="v5-how-title" className="v5-h2">
            {studio?.stepsTitle ? (
              <AccentLast text={studio.stepsTitle} />
            ) : (
              <>
                Required training made quick and <em>simple.</em>
              </>
            )}
          </h2>
          <p className="v5-lede">{studio?.stepsLede || LEDE[audience]}</p>
        </Reveal>
        <ol className="v5-how__grid">
          {steps.map((s, i) => (
            <Reveal as="li" key={i} index={i} className="v5-how__step">
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
