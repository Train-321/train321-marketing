"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import "./demo.css";

const INTEREST_OPTIONS = [
  "Food Handler",
  "Food Manager",
  "Alcohol / TIPS",
  "Sexual Harassment",
  "Allergen Awareness",
  "Custom / SOP"
];

const AGENDA = [
  {
    time: "0-3 min",
    title: "Tell us about your team",
    desc: "Size, locations, current training vendor, and the compliance deadlines actually on your calendar."
  },
  {
    time: "3-10 min",
    title: "Learner flow walkthrough",
    desc: "We show the actual course, the mobile experience, the auto-save, and the certificate delivery. On a phone, not a mockup."
  },
  {
    time: "10-15 min",
    title: "Manager dashboard & reporting",
    desc: "CSV import, seat assignment, progress filters, and the reports your auditor will ask for — walked end-to-end."
  },
  {
    time: "15-20 min",
    title: "Pricing & next steps",
    desc: "Your volume-discounted quote, your rollout timeline, and whether we're the right fit. If we're not, we'll say so."
  }
];

const DEMO_FAQS = [
  {
    q: "Do I have to commit to anything on the call?",
    a: "No. We've built our whole sales process around the answer being \"we'll think about it\" — no contracts, no proposals, no closing pressure on the call. You get a written quote by email; decide in your own time."
  },
  {
    q: "Can I bring teammates?",
    a: "Absolutely — most customers bring their ops lead and HR lead. The demo is built for a mixed audience."
  },
  {
    q: "What if my team is under 10 people?",
    a: "We'll happily still do a demo, but honestly — most small teams don't need a sales conversation. Go to the catalog, buy what you need, and email us if you hit a snag."
  },
  {
    q: "Do you sign BAA / DPAs?",
    a: "Yes. We have a standard DPA ready for EU data and a BAA on request. Both get sent after the demo."
  },
  {
    q: "How fast can we roll out?",
    a: "For teams under 100 people: same-day self-serve. For teams 100-1,000: 3-5 business days with CSV import and SSO. For larger rollouts: 2-3 weeks with a named onboarding lead."
  }
];

type FormState = {
  name: string;
  email: string;
  company: string;
  seats: string;
  interests: string[];
  timeslot: string;
  notes: string;
};

const EMPTY_FORM: FormState = {
  name: "",
  email: "",
  company: "",
  seats: "",
  interests: [],
  timeslot: "",
  notes: ""
};

type VideoItem = {
  id: string;
  name: string;
  playing: boolean;
};

export default function DemoPage() {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [sent, setSent] = useState(false);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("https://api.train321.com/tour/demovideos")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))))
      .then((rows) => {
        if (cancelled) return;
        const list = Array.isArray(rows) ? rows : [];
        setVideos(
          list
            .filter((v) => v && v.vimeo_video_id)
            .map((v) => ({
              id: String(v.vimeo_video_id),
              name: v.name || "Walkthrough",
              playing: false
            }))
        );
      })
      .catch(() => {
        if (!cancelled) setVideos([]);
      })
      .finally(() => {
        if (!cancelled) setVideosLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const update = <K extends keyof FormState>(key: K) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [key]: e.target.value as FormState[K] }));

  const toggleInterest = (opt: string) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(opt)
        ? prev.interests.filter((i) => i !== opt)
        : [...prev.interests, opt]
    }));
  };

  const playVideo = (id: string) => {
    setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, playing: true } : v)));
  };

  return (
    <div className="t321-mkt-demo">
      <section className="t321-mkt-demo__hero">
        <div className="t321-mkt-container t321-mkt-demo__hero-grid">
          <div>
            <span className="t321-mkt-eyebrow"><i className="fas fa-play-circle" /> Book a walkthrough</span>
            <h1 className="t321-mkt-h1">See Train321 with your courses already loaded.</h1>
            <p className="t321-mkt-lede">
              Pick a 20-minute slot. We&apos;ll share a screen, walk through the learner flow,
              the manager dashboard, and the reporting you&apos;d use on day one — using sample
              data that matches your operation.
            </p>
            <ul className="t321-mkt-demo__hero-list">
              <li><i className="fas fa-check" /> 20-minute live walkthrough</li>
              <li><i className="fas fa-check" /> Real platform, not a slideshow</li>
              <li><i className="fas fa-check" /> Custom pricing quote within 24 hours</li>
              <li><i className="fas fa-check" /> No sales pressure — we just want a fit</li>
            </ul>
          </div>

          <form className="t321-mkt-demo__form" onSubmit={onSubmit}>
            <h2 className="t321-mkt-h3">Request a time</h2>

            <div className="t321-mkt-demo__row">
              <label className="t321-mkt-demo__field">
                <span>Full name</span>
                <input value={form.name} onChange={update("name")} type="text" required autoComplete="name" placeholder="Jane Doe" />
              </label>
              <label className="t321-mkt-demo__field">
                <span>Work email</span>
                <input value={form.email} onChange={update("email")} type="email" required autoComplete="email" placeholder="you@work.com" />
              </label>
            </div>

            <div className="t321-mkt-demo__row">
              <label className="t321-mkt-demo__field">
                <span>Company</span>
                <input value={form.company} onChange={update("company")} type="text" required autoComplete="organization" placeholder="Coastal Hospitality Group" />
              </label>
              <label className="t321-mkt-demo__field">
                <span>Team size</span>
                <select value={form.seats} onChange={update("seats")} required>
                  <option value="" disabled>Pick a range</option>
                  <option>1-10</option>
                  <option>11-50</option>
                  <option>51-200</option>
                  <option>201-500</option>
                  <option>500+</option>
                </select>
              </label>
            </div>

            <label className="t321-mkt-demo__field">
              <span>Which courses are you most interested in?</span>
              <div className="t321-mkt-demo__chips">
                {INTEREST_OPTIONS.map((opt) => (
                  <label key={opt} className="t321-mkt-demo__chip">
                    <input
                      type="checkbox"
                      value={opt}
                      checked={form.interests.includes(opt)}
                      onChange={() => toggleInterest(opt)}
                    />
                    <span>{opt}</span>
                  </label>
                ))}
              </div>
            </label>

            <label className="t321-mkt-demo__field">
              <span>Best time to meet</span>
              <select value={form.timeslot} onChange={update("timeslot")} required>
                <option value="" disabled>Choose a window</option>
                <option>Tomorrow morning (9am-12pm CT)</option>
                <option>Tomorrow afternoon (1pm-5pm CT)</option>
                <option>This week — flexible</option>
                <option>Next week — flexible</option>
                <option>Just send me a Calendly link</option>
              </select>
            </label>

            <label className="t321-mkt-demo__field">
              <span>Anything we should know?</span>
              <textarea value={form.notes} onChange={update("notes")} rows={3} placeholder="Deadline, specific audit, integration questions — optional." />
            </label>

            <button type="submit" className="t321-mkt-btn t321-mkt-btn--primary t321-mkt-btn--lg" disabled={sent}>
              <i className="fas fa-calendar-check" aria-hidden="true" />
              {sent ? " Request received" : " Book my demo"}
            </button>
            {sent ? (
              <p className="t321-mkt-demo__ok">
                <i className="fas fa-check-circle" /> Thanks {form.name.split(" ")[0]} — we&apos;ll email you within 2 business hours.
              </p>
            ) : (
              <p className="t321-mkt-demo__disclaim">
                We&apos;ll never share your info. Expect a reply from a real human within 2 business hours.
              </p>
            )}
          </form>
        </div>
      </section>

      {(videosLoading || videos.length > 0) && (
        <section className="t321-mkt-section t321-mkt-demo__videos-section">
          <div className="t321-mkt-container">
            <div className="t321-mkt-section__head">
              <span className="t321-mkt-eyebrow"><i className="fas fa-film" /> See it in action</span>
              <h2 className="t321-mkt-h2">Watch a quick walkthrough</h2>
              <p className="t321-mkt-lede">
                Short clips from the actual learner and manager experience — tap any to play inline.
              </p>
            </div>

            {videosLoading ? (
              <div className="t321-mkt-demo__videos" aria-hidden="true">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="t321-mkt-demo__video-card t321-mkt-demo__video-card--skel" />
                ))}
              </div>
            ) : (
              <div className="t321-mkt-demo__videos">
                {videos.map((v) => (
                  <article key={v.id} className="t321-mkt-demo__video-card t321-mkt-card">
                    <div className="t321-mkt-demo__video-frame">
                      {!v.playing ? (
                        <button
                          type="button"
                          className="t321-mkt-demo__video-poster"
                          aria-label={`Play ${v.name}`}
                          onClick={() => playVideo(v.id)}
                        >
                          <span className="t321-mkt-demo__video-play" aria-hidden="true">
                            <i className="fas fa-play" />
                          </span>
                          <span className="t321-mkt-demo__video-tag" aria-hidden="true">Demo</span>
                        </button>
                      ) : (
                        <iframe
                          src={`https://player.vimeo.com/video/${v.id}?autoplay=1&title=0&byline=0&portrait=0`}
                          title={v.name}
                          frameBorder="0"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="t321-mkt-demo__video-body">
                      <h3 className="t321-mkt-h3">{v.name}</h3>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="t321-mkt-section t321-mkt-section--sunk">
        <div className="t321-mkt-container">
          <div className="t321-mkt-section__head">
            <span className="t321-mkt-eyebrow"><i className="fas fa-route" /> What we&apos;ll cover</span>
            <h2 className="t321-mkt-h2">The 20-minute agenda</h2>
          </div>
          <div className="t321-mkt-demo__agenda">
            {AGENDA.map((step, i) => (
              <article key={step.title} className="t321-mkt-demo__agenda-item t321-mkt-card">
                <span className="t321-mkt-demo__agenda-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="t321-mkt-demo__agenda-time">{step.time}</span>
                <h3 className="t321-mkt-h3">{step.title}</h3>
                <p>{step.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="t321-mkt-section">
        <div className="t321-mkt-container">
          <div className="t321-mkt-section__head">
            <span className="t321-mkt-eyebrow"><i className="fas fa-question-circle" /> Common questions</span>
            <h2 className="t321-mkt-h2">What people ask before the call</h2>
          </div>
          <div className="t321-mkt-demo__faqs">
            {DEMO_FAQS.map((q, i) => (
              <details key={i} className="t321-mkt-demo__faq">
                <summary>
                  <span>{q.q}</span>
                  <i className="fas fa-plus" aria-hidden="true" />
                </summary>
                <p>{q.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="t321-mkt-section t321-mkt-section--ink">
        <div className="t321-mkt-container t321-mkt-demo__cta">
          <div>
            <h2 className="t321-mkt-h2">Rather just try it yourself?</h2>
            <p className="t321-mkt-lede">
              Any individual course is buyable in two clicks — no sales call required.
            </p>
          </div>
          <div className="t321-mkt-demo__cta-actions">
            <Link href="/catalog" className="t321-mkt-btn t321-mkt-btn--accent t321-mkt-btn--lg">
              Browse the catalog
              <i className="fas fa-arrow-right" aria-hidden="true" />
            </Link>
            <Link href="/contact" className="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg">
              Contact sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
