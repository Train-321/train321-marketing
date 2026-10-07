"use client";

// Dark proof band: the Studio-managed company stats counting up, plus the
// accreditation claims that make a compliance buyer comfortable.

import { CountUp, Reveal } from "./motion";

type Stat = { value: string; label: string };

const FALLBACK: Stat[] = [
  { value: "50,000+", label: "Certificates issued" },
  { value: "5,000+", label: "Locations trained" },
  { value: "50", label: "States accepted" },
  { value: "4.8/5", label: "Average learner rating" }
];

const PROOF = [
  { icon: "fa-certificate", title: "ANSI / ANAB accredited", body: "The accreditation health departments look for on a food handler card." },
  { icon: "fa-landmark", title: "State-approved providers", body: "TABC, California RBS, Florida RVT, Illinois BASSET and more — the official versions." },
  { icon: "fa-language", title: "English and Spanish", body: "Most courses in both, with the same certificate at the end." },
  { icon: "fa-headset", title: "Real people on the phone", body: "561-325-7300. Since 2020, that's how we've answered." }
];

export default function StatsBand({ stats }: { stats: Stat[] }) {
  const list = stats.length ? stats.slice(0, 4) : FALLBACK;
  return (
    <section className="v5-section v5-stats" aria-label="Train 321 by the numbers">
      <div className="v5-container">
        <dl className="v5-stats__grid">
          {list.map((s, i) => (
            <Reveal as="div" key={s.label} index={i} className="v5-stats__item">
              <dd>
                <CountUp value={s.value} />
              </dd>
              <dt>{s.label}</dt>
            </Reveal>
          ))}
        </dl>
        <ul className="v5-stats__proof">
          {PROOF.map((p, i) => (
            <Reveal as="li" key={p.title} index={i + 2}>
              <i className={`fas ${p.icon}`} aria-hidden="true" />
              <strong>{p.title}</strong>
              <span>{p.body}</span>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
