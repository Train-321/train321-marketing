"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import type { DemoPage } from "@/lib/sanity";
import { trackGenerateLead } from "@/lib/analytics";
import CustomSelect from "@/components/CustomSelect";
import VideoModal from "@/components/VideoModal";
import "./demo.css";

const FALLBACK_INTERESTS = [
  "Food Handler",
  "Food Manager",
  "Alcohol / TIPS",
  "Sexual Harassment",
  "Allergen Awareness",
  "Custom / SOP"
];

const FALLBACK_TEAM_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];

const FALLBACK_TIMESLOTS = [
  "Tomorrow morning (9am-12pm CT)",
  "Tomorrow afternoon (1pm-5pm CT)",
  "This week — flexible",
  "Next week — flexible",
  "Just send me a Calendly link"
];

const FALLBACK_HERO_BULLETS = [
  "20-minute live walkthrough",
  "Real platform, not a slideshow",
  "Custom pricing quote within 24 hours",
  "No sales pressure — we just want a fit"
];

const FALLBACK_AGENDA = [
  { time: "0-3 min", title: "Tell us about your team", desc: "Size, locations, current training vendor, and the compliance deadlines actually on your calendar." },
  { time: "3-10 min", title: "Learner flow walkthrough", desc: "We show the actual course, the mobile experience, the auto-save, and the certificate delivery. On a phone, not a mockup." },
  { time: "10-15 min", title: "Manager dashboard & reporting", desc: "CSV import, seat assignment, progress filters, and the reports your auditor will ask for — walked end-to-end." },
  { time: "15-20 min", title: "Pricing & next steps", desc: "Your volume-discounted quote, your rollout timeline, and whether we're the right fit. If we're not, we'll say so." }
];

const FALLBACK_FAQS = [
  { q: "Do I have to commit to anything on the call?", a: "No. We've built our whole sales process around the answer being \"we'll think about it\" — no contracts, no proposals, no closing pressure on the call. You get a written quote by email; decide in your own time." },
  { q: "Can I bring teammates?", a: "Absolutely — most customers bring their ops lead and HR lead. The demo is built for a mixed audience." },
  { q: "What if my team is under 10 people?", a: "We'll happily still do a demo, but honestly — most small teams don't need a sales conversation. Go to the catalog, buy what you need, and email us if you hit a snag." },
  { q: "Do you sign BAA / DPAs?", a: "Yes. We have a standard DPA ready for EU data and a BAA on request. Both get sent after the demo." },
  { q: "How fast can we roll out?", a: "For teams under 100 people: same-day self-serve. For teams 100-1,000: 3-5 business days with CSV import and SSO. For larger rollouts: 2-3 weeks with a named onboarding lead." }
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

type VideoItem = { id: string; name: string; thumbnail: string | null };

type Props = { page: DemoPage | null };

export default function DemoClient({ page }: Props) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [sent, setSent] = useState(false);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  const heroEyebrow = page?.heroEyebrow || "Book a walkthrough";
  const heroHeading = page?.heroHeading || "See Train 321 with your courses already loaded.";
  const heroLede =
    page?.heroLede ||
    "Pick a 20-minute slot. We'll share a screen, walk through the learner flow, the manager dashboard, and the reporting you'd use on day one — using sample data that matches your operation.";
  const heroBullets = page?.heroBullets?.length ? page.heroBullets : FALLBACK_HERO_BULLETS;

  const formHeading = page?.formHeading || "Request a time";
  const teamSizes = page?.teamSizeOptions?.length ? page.teamSizeOptions : FALLBACK_TEAM_SIZES;
  const timeslots = page?.timeslotOptions?.length ? page.timeslotOptions : FALLBACK_TIMESLOTS;
  const interests = page?.interestOptions?.length ? page.interestOptions : FALLBACK_INTERESTS;
  const submitLabel = page?.submitLabel || "Book my demo";
  const submitSendingLabel = page?.submitSendingLabel || "Request received";
  // Editable in Studio (Demo page → Booking form). The fallback keeps the
  // field usable if an editor clears it.
  const notesPlaceholder =
    page?.notesPlaceholder ||
    "Tell us about your training needs, timeline, integrations, or anything specific you would like us to cover.";
  const successText = page?.successText || "Thanks {name} — we'll email you within 2 business hours.";
  const disclaimer =
    page?.disclaimer ||
    "We'll never share your info. Expect a reply from a real human within 2 business hours.";

  // Demo gallery. Copy is editable in Studio; the cards fall back to the LMS
  // feed unless an editor has added their own below.
  const demoEyebrow = page?.demoHead?.eyebrow || "See it in action";
  const demoHeading = page?.demoHead?.heading || "A closer look at what we do";
  const demoIcon = page?.demoHead?.icon || "fas fa-film";
  const demoLede =
    page?.demoHead?.lede ||
    "Explore real examples of our platform, custom training, branded programs, and client solutions.";

  const studioVideos: VideoItem[] = (page?.demoVideos || [])
    .filter((v) => !v.hidden && v.title)
    .sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999))
    .map((v) => ({
      // The player takes a Vimeo id, so pull the trailing digits out of
      // whatever shape the editor pasted (full URL, /video/<id>, or a bare id).
      id: String(v.videoUrl || "").match(/(\d{6,})/)?.[1] || "",
      name: v.title || "",
      thumbnail: v.image || null
    }))
    .filter((v) => v.id);

  const agendaEyebrow = page?.agendaHead?.eyebrow || "What we'll cover";
  const agendaHeading = page?.agendaHead?.heading || "The 20-minute agenda";
  const agendaIcon = page?.agendaHead?.icon || "fas fa-route";
  const agenda = page?.agenda?.length ? page.agenda : FALLBACK_AGENDA;

  const faqEyebrow = page?.faqHead?.eyebrow || "Common questions";
  const faqHeading = page?.faqHead?.heading || "What people ask before the call";
  const faqIcon = page?.faqHead?.icon || "fas fa-question-circle";
  const faqs = page?.faqs?.length ? page.faqs : FALLBACK_FAQS;

  const cta = page?.bottomCta;
  const ctaHeading = cta?.heading || "Rather just try it yourself?";
  const ctaLede =
    cta?.lede || "Any individual course is buyable in two clicks — no sales call required.";
  const ctaPrimaryLabel = cta?.primaryCta?.label || "Browse the catalog";
  const ctaPrimaryHref = cta?.primaryCta?.to || "/catalog";
  const ctaSecondaryLabel = cta?.secondaryCta?.label || "Contact sales";
  const ctaSecondaryHref = cta?.secondaryCta?.to || "/contact";

  useEffect(() => {
    // Studio cards win outright — skip the LMS round-trip entirely so the two
    // lists can't briefly fight over the gallery on load.
    if (studioVideos.length) {
      setVideos(studioVideos);
      setVideosLoading(false);
      return;
    }
    let cancelled = false;
    fetch("https://api.train321.com/tour/demovideos")
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))))
      .then(async (rows) => {
        if (cancelled) return;
        const list = (Array.isArray(rows) ? rows : []).filter((v) => v && v.vimeo_video_id);
        const items = await Promise.all(
          list.map(async (v: { vimeo_video_id: string | number; name?: string }) => {
            const id = String(v.vimeo_video_id);
            let thumbnail: string | null = null;
            try {
              const oe = await fetch(
                `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${id}&width=640`
              );
              if (oe.ok) {
                const data = await oe.json();
                thumbnail = data?.thumbnail_url || null;
              }
            } catch {
              /* fall back to gradient */
            }
            return { id, name: v.name || "Walkthrough", thumbnail };
          })
        );
        if (!cancelled) setVideos(items);
      })
      .catch(() => { if (!cancelled) setVideos([]); })
      .finally(() => { if (!cancelled) setVideosLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackGenerateLead("demo_request");
    setSent(true);
  };
  const update = <K extends keyof FormState>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value as FormState[K] }));
  const toggleInterest = (opt: string) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(opt)
        ? prev.interests.filter((i) => i !== opt)
        : [...prev.interests, opt]
    }));
  };

  const successFilled = successText.replace("{name}", form.name.split(" ")[0] || "");

  return (
    <div className="t321-mkt-demo">
      {(videosLoading || videos.length > 0) && (
        <section className="t321-mkt-section t321-mkt-demo__videos-section">
          <div className="t321-mkt-container">
            <div className="t321-mkt-section__head">
              <span className="t321-mkt-eyebrow"><i className={demoIcon} /> {demoEyebrow}</span>
              <h2 className="t321-mkt-h2">{demoHeading}</h2>
              <p className="t321-mkt-lede">{demoLede}</p>
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
                      <button
                        type="button"
                        className={`t321-mkt-demo__video-poster${v.thumbnail ? " has-thumb" : ""}`}
                        aria-label={`Play ${v.name}`}
                        onClick={() => setActiveVideo(v)}
                        style={v.thumbnail ? { backgroundImage: `url(${v.thumbnail})` } : undefined}
                      >
                        <span className="t321-mkt-demo__video-play" aria-hidden="true"><i className="fas fa-play" /></span>
                      </button>
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
            <span className="t321-mkt-eyebrow"><i className={agendaIcon} /> {agendaEyebrow}</span>
            <h2 className="t321-mkt-h2">{agendaHeading}</h2>
          </div>
          <div className="t321-mkt-demo__agenda">
            {agenda.map((step, i) => (
              <article key={i} className="t321-mkt-demo__agenda-item t321-mkt-card">
                <span className="t321-mkt-demo__agenda-num">{String(i + 1).padStart(2, "0")}</span>
                {step.time && <span className="t321-mkt-demo__agenda-time">{step.time}</span>}
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
            <span className="t321-mkt-eyebrow"><i className={faqIcon} /> {faqEyebrow}</span>
            <h2 className="t321-mkt-h2">{faqHeading}</h2>
          </div>
          <div className="t321-mkt-demo__faqs">
            {faqs.map((q, i) => (
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

      <section className="t321-mkt-section t321-mkt-section--sunk t321-mkt-demo__form-section">
        <div className="t321-mkt-container t321-mkt-demo__hero-grid">
          <div className="t321-mkt-demo__hero-intro">
            <span className="t321-mkt-eyebrow"><i className="fas fa-play-circle" /> {heroEyebrow}</span>
            {/* Element stays an h1 — the page's single top-level heading — but
                wears the h2 style so it reads like the other section heads. */}
            <h1 className="t321-mkt-h2">{heroHeading}</h1>
            <p className="t321-mkt-lede">{heroLede}</p>
            <ul className="t321-mkt-demo__hero-list">
              {heroBullets.map((b, i) => (
                <li key={i}><i className="fas fa-check" /> {b}</li>
              ))}
            </ul>
          </div>

          <form className="t321-mkt-demo__form" onSubmit={onSubmit}>
            <h2 className="t321-mkt-h3">{formHeading}</h2>

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
                <CustomSelect
                  value={form.seats}
                  options={teamSizes}
                  placeholder="Pick a range"
                  ariaLabel="Team size"
                  onChange={(v) => setForm((prev) => ({ ...prev, seats: v }))}
                />
              </label>
            </div>

            <label className="t321-mkt-demo__field">
              <span>Which courses are you most interested in?</span>
              <div className="t321-mkt-demo__chips">
                {interests.map((opt) => (
                  <label key={opt} className="t321-mkt-demo__chip">
                    <input type="checkbox" value={opt} checked={form.interests.includes(opt)} onChange={() => toggleInterest(opt)} />
                    <span className="t321-mkt-demo__chip-label">{opt}</span>
                  </label>
                ))}
              </div>
            </label>

            <label className="t321-mkt-demo__field">
              <span>Best time to meet</span>
              <CustomSelect
                value={form.timeslot}
                options={timeslots}
                placeholder="Choose a window"
                ariaLabel="Best time to meet"
                onChange={(v) => setForm((prev) => ({ ...prev, timeslot: v }))}
              />
            </label>

            <label className="t321-mkt-demo__field">
              <span>Anything we should know?</span>
              <textarea
                value={form.notes}
                onChange={update("notes")}
                rows={3}
                placeholder={notesPlaceholder}
              />
            </label>

            <button type="submit" className="t321-mkt-btn t321-mkt-btn--primary t321-mkt-btn--lg" disabled={sent}>
              <i className="fas fa-calendar-check" aria-hidden="true" />
              {sent ? ` ${submitSendingLabel}` : ` ${submitLabel}`}
            </button>
            {sent ? (
              <p className="t321-mkt-demo__ok">
                <i className="fas fa-check-circle" /> {successFilled}
              </p>
            ) : (
              <p className="t321-mkt-demo__disclaim">{disclaimer}</p>
            )}
          </form>
        </div>
      </section>

      <section className="t321-mkt-section t321-mkt-section--ink">
        <div className="t321-mkt-container t321-mkt-demo__cta">
          <div>
            <h2 className="t321-mkt-h2">{ctaHeading}</h2>
            <p className="t321-mkt-lede">{ctaLede}</p>
          </div>
          <div className="t321-mkt-demo__cta-actions">
            <Link href={ctaPrimaryHref} className="t321-mkt-btn t321-mkt-btn--accent t321-mkt-btn--lg">
              {ctaPrimaryLabel}
              <i className="fas fa-arrow-right" aria-hidden="true" />
            </Link>
            <Link href={ctaSecondaryHref} className="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg">
              {ctaSecondaryLabel}
            </Link>
          </div>
        </div>
      </section>

      <VideoModal
        vimeoId={activeVideo?.id || null}
        title={activeVideo?.name}
        onClose={() => setActiveVideo(null)}
      />
    </div>
  );
}
