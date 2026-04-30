"use client";

import Link from "next/link";
import { useTina } from "tinacms/dist/react";
import type {
  TeamMemberConnectionQuery,
  TeamMemberConnectionQueryVariables,
  SiteSettingsQuery,
  SiteSettingsQueryVariables
} from "@/tina/__generated__/types";
import "./about.css";

function initials(name: string) {
  return (name || "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

type TeamRes = {
  data: TeamMemberConnectionQuery;
  query: string;
  variables: TeamMemberConnectionQueryVariables;
};
type SettingsRes = {
  data: SiteSettingsQuery;
  query: string;
  variables: SiteSettingsQueryVariables;
};

export default function AboutClient({
  teamRes,
  settingsRes
}: {
  teamRes: TeamRes;
  settingsRes: SettingsRes;
}) {
  const { data: teamData } = useTina(teamRes);
  const { data: settingsData } = useTina(settingsRes);

  const team = (teamData.teamMemberConnection.edges || [])
    .map((e) => e?.node)
    .filter((n): n is NonNullable<typeof n> => Boolean(n))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const companyStats = (settingsData.siteSettings.companyStats || []).filter(
    (s): s is NonNullable<typeof s> => Boolean(s)
  );

  return (
    <div className="t321-mkt-about">
      <section className="t321-mkt-about__hero">
        <div className="t321-mkt-container">
          <span className="t321-mkt-eyebrow"><i className="fas fa-users" /> Our story</span>
          <h1 className="t321-mkt-h1">Compliance training shouldn&apos;t feel like a tax.</h1>
          <p className="t321-mkt-lede">
            We started Train321 in 2018 because the alternatives felt built for lawyers,
            not for line cooks. Six years later, we&apos;ve issued over 500,000 certificates
            to teams who actually finished the course.
          </p>
        </div>
      </section>

      <section className="t321-mkt-section">
        <div className="t321-mkt-container t321-mkt-about__story">
          <div className="t321-mkt-about__story-body">
            <span className="t321-mkt-eyebrow">The mission</span>
            <h2 className="t321-mkt-h2">Make training so good, teams finish it</h2>
            <p>
              The hospitality industry spends billions of dollars a year on compliance training
              that nobody watches. Vendors produce 1997-era slideshows, teams click through on
              autopilot, and the paperwork gets filed. Then an inspector shows up, and the only
              thing that&apos;s actually changed is a folder full of certificates.
            </p>
            <p>
              We&apos;re building the other thing. Short, direct, written by people who worked the
              line. Mobile-first because our learners are taking it on their phone between a prep
              shift and a dinner rush. Updated the day a law changes — not the quarter after.
            </p>
            <p>
              That&apos;s our whole thesis. If we can make training so good that people actually learn
              from it, compliance takes care of itself.
            </p>
          </div>
          <aside className="t321-mkt-about__stats" aria-label="Company stats">
            {companyStats.map((s) => (
              <div key={s.label} className="t321-mkt-about__stat">
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </aside>
        </div>
      </section>

      <section className="t321-mkt-section t321-mkt-section--sunk">
        <div className="t321-mkt-container">
          <div className="t321-mkt-section__head">
            <span className="t321-mkt-eyebrow"><i className="fas fa-compass" /> What we believe</span>
            <h2 className="t321-mkt-h2">Three things we refuse to compromise on</h2>
          </div>
          <div className="t321-mkt-about__pillars">
            <article className="t321-mkt-about__pillar t321-mkt-card">
              <span className="t321-mkt-about__pillar-icon t321-mkt-about__pillar-icon--accent">
                <i className="fas fa-microscope" />
              </span>
              <h3 className="t321-mkt-h3">Content accuracy</h3>
              <p>
                Every course is written by a subject-matter expert and reviewed annually. When laws
                change, our courses change the same week. No ghost-written freelance copy; no
                auto-translated modules.
              </p>
            </article>
            <article className="t321-mkt-about__pillar t321-mkt-card">
              <span className="t321-mkt-about__pillar-icon t321-mkt-about__pillar-icon--warn">
                <i className="fas fa-mobile-alt" />
              </span>
              <h3 className="t321-mkt-h3">Learner experience</h3>
              <p>
                If a cook can&apos;t finish a course on their phone during prep, we&apos;ve failed. Every
                course is playable in 15-minute chunks, saves progress automatically, and works on
                a $80 Android with a cracked screen.
              </p>
            </article>
            <article className="t321-mkt-about__pillar t321-mkt-card">
              <span className="t321-mkt-about__pillar-icon t321-mkt-about__pillar-icon--positive">
                <i className="fas fa-dollar-sign" />
              </span>
              <h3 className="t321-mkt-h3">Pricing transparency</h3>
              <p>
                No &ldquo;contact us for pricing.&rdquo; No per-feature upsells. You see the
                price on every course page, volume discounts apply automatically, and unused
                seats are refundable for 60 days.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="t321-mkt-section">
        <div className="t321-mkt-container">
          <div className="t321-mkt-section__head">
            <span className="t321-mkt-eyebrow"><i className="fas fa-user-friends" /> The team</span>
            <h2 className="t321-mkt-h2">People behind the platform</h2>
            <p className="t321-mkt-lede">
              A small team — around 30 of us — split between curriculum, customer success, and
              engineering. Most of us have worked the line.
            </p>
          </div>
          <div className="t321-mkt-about__team">
            {team.map((m) => (
              <article key={m._sys.filename} className="t321-mkt-about__team-card t321-mkt-card">
                <div className="t321-mkt-about__avatar" aria-hidden="true">{initials(m.name)}</div>
                <h3 className="t321-mkt-h3">{m.name}</h3>
                <span className="t321-mkt-about__team-role">{m.role}</span>
                <p>{m.bio}</p>
                <div className="t321-mkt-about__socials">
                  {m.linkedin && <a href={m.linkedin} aria-label="LinkedIn"><i className="fab fa-linkedin-in" /></a>}
                  {m.twitter && <a href={m.twitter} aria-label="Twitter"><i className="fab fa-twitter" /></a>}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="t321-mkt-section t321-mkt-section--ink">
        <div className="t321-mkt-container t321-mkt-about__cta">
          <div>
            <h2 className="t321-mkt-h2">Want to see how we work?</h2>
            <p className="t321-mkt-lede">
              Book a 20-minute demo. We&apos;ll show you the platform with your courses already loaded.
            </p>
          </div>
          <div className="t321-mkt-about__cta-actions">
            <Link href="/demo" className="t321-mkt-btn t321-mkt-btn--accent t321-mkt-btn--lg">
              Book a demo
            </Link>
            <Link href="/contact" className="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
