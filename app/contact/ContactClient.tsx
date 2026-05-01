"use client";

import Link from "next/link";
import { useState } from "react";
import type { ContactPage, SiteSettings } from "@/lib/sanity";
import "./contact.css";

const FALLBACK_TILES = [
  { icon: "fas fa-phone", title: "Call us", sub: "Mon-Fri · 7am-7pm CT", linkLabel: "PHONE", linkHref: "tel:+15613257300" },
  { icon: "fas fa-envelope", title: "Email us", sub: "Typical reply · under 2 hrs", linkLabel: "EMAIL", linkHref: "mailto:info@train321.com" },
  { icon: "fas fa-comment-dots", title: "Live chat", sub: "Avg wait · 42 sec", linkLabel: "Start a conversation", linkHref: "#" },
  { icon: "fas fa-book-open", title: "Browse FAQs", sub: "Certificates, refunds, billing", linkLabel: "50+ answers", linkHref: "/faq" }
];

const FALLBACK_TOPICS = [
  "Sales & pricing",
  "Account support",
  "Certificate issue",
  "Billing question",
  "Custom / white-label",
  "Press",
  "Other"
];

const FALLBACK_FAQS = [
  { q: "I can't log in", a: "Try a password reset first — it sends a link to your email in under a minute. If the email doesn't arrive, check spam, then email support@train321.com with your username and we'll help within 2 business hours." },
  { q: "I need a copy of my certificate", a: "Log in to your account and go to Certificates — every certificate you've earned is there as a PDF. If you can't log in, email support@train321.com with the email you used when you enrolled." },
  { q: "I enrolled someone by mistake", a: "If the learner hasn't started the course, we can transfer the seat at no cost. Email support@train321.com with both names." },
  { q: "I need a receipt for accounting", a: "All receipts are in your dashboard under Billing. For corporate accounts, we also email a monthly summary to your admin contact." }
];

const EMPTY_FORM = { name: "", email: "", company: "", topic: "", message: "" };

type Props = { page: ContactPage | null; settings?: SiteSettings };

// Some links shouldn't go through next/link (mailto:, tel:, #, http(s)).
const isExternal = (href: string) =>
  !href || /^(mailto:|tel:|#|https?:)/i.test(href);

export default function ContactClient({ page, settings }: Props) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [sent, setSent] = useState(false);

  const heroEyebrow = page?.heroEyebrow || "Get in touch";
  const heroHeading = page?.heroHeading || "We'd love to hear from you.";
  const heroLede =
    page?.heroLede ||
    "Real humans. Real answers. Typical reply in under two hours during business hours.";

  // Auto-fill phone/email tile links from siteSettings when the tile's URL
  // is a placeholder, so editing the global phone updates the contact page too.
  const phone = settings?.phone || "561-325-7300";
  const email = settings?.email || "info@train321.com";
  const tiles = (page?.tiles?.length ? page.tiles : FALLBACK_TILES).map((t) => ({
    ...t,
    linkHref:
      t.linkHref === "PHONE" ? `tel:+1${phone.replace(/\D/g, "")}` :
      t.linkHref === "EMAIL" ? `mailto:${email}` :
      t.linkHref
  }));

  const formHeading = page?.formHeading || "Send us a message";
  const formLede = page?.formLede || "Fill out the form below and the right person on our team will pick it up.";
  const topics = page?.topicOptions?.length ? page.topicOptions : FALLBACK_TOPICS;
  const submitLabel = page?.submitLabel || "Send message";
  const submitSendingLabel = page?.submitSendingLabel || "Message sent";
  const successText = page?.successText || "We'll reply within 2 business hours.";

  const faqEyebrow = page?.quickFaqsHead?.eyebrow || "Quick answers";
  const faqHeading = page?.quickFaqsHead?.heading || "The things most people ask first";
  const faqIcon = page?.quickFaqsHead?.icon || "fas fa-question-circle";
  const faqs = page?.quickFaqs?.length ? page.quickFaqs : FALLBACK_FAQS;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setForm(EMPTY_FORM);
    }, 4000);
  };

  const update =
    (key: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="t321-mkt-contact">
      <section className="t321-mkt-contact__hero">
        <div className="t321-mkt-container">
          <span className="t321-mkt-eyebrow"><i className="fas fa-comments" /> {heroEyebrow}</span>
          <h1 className="t321-mkt-h1">{heroHeading}</h1>
          <p className="t321-mkt-lede">{heroLede}</p>
        </div>
      </section>

      <section className="t321-mkt-section">
        <div className="t321-mkt-container t321-mkt-contact__grid">
          <aside className="t321-mkt-contact__side">
            {tiles.map((t, i) => {
              const tone = ["accent", "positive", "warn", "purple"][i % 4];
              const linkContent = t.linkLabel || t.linkHref;
              const link = !t.linkHref ? null : isExternal(t.linkHref) ? (
                <a href={t.linkHref}>{linkContent}</a>
              ) : (
                <Link href={t.linkHref}>{linkContent}</Link>
              );
              return (
                <div key={i} className="t321-mkt-contact__tile t321-mkt-card">
                  <span className={`t321-mkt-contact__tile-icon t321-mkt-contact__tile-icon--${tone}`}>
                    <i className={t.icon || "fas fa-circle"} />
                  </span>
                  <strong>{t.title}</strong>
                  {link}
                  {t.sub && <small>{t.sub}</small>}
                </div>
              );
            })}
          </aside>

          <form className="t321-mkt-contact__form" onSubmit={onSubmit}>
            <h2 className="t321-mkt-h2">{formHeading}</h2>
            <p className="t321-mkt-lede">{formLede}</p>

            <div className="t321-mkt-contact__row">
              <label className="t321-mkt-contact__field">
                <span>Your name</span>
                <input value={form.name} onChange={update("name")} type="text" required autoComplete="name" placeholder="Jane Doe" />
              </label>
              <label className="t321-mkt-contact__field">
                <span>Email</span>
                <input value={form.email} onChange={update("email")} type="email" required autoComplete="email" placeholder="you@work.com" />
              </label>
            </div>

            <div className="t321-mkt-contact__row">
              <label className="t321-mkt-contact__field">
                <span>Company</span>
                <input value={form.company} onChange={update("company")} type="text" autoComplete="organization" placeholder="Coastal Hospitality Group" />
              </label>
              <label className="t321-mkt-contact__field">
                <span>How can we help?</span>
                <select value={form.topic} onChange={update("topic")} required>
                  <option value="" disabled>Pick a topic</option>
                  {topics.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="t321-mkt-contact__field">
              <span>Message</span>
              <textarea value={form.message} onChange={update("message")} rows={5} required placeholder="Tell us a bit about what you need — team size, timeline, anything that helps us reply quickly." />
            </label>

            <div className="t321-mkt-contact__actions">
              <button type="submit" className="t321-mkt-btn t321-mkt-btn--primary t321-mkt-btn--lg" disabled={sent}>
                <i className="fas fa-paper-plane" aria-hidden="true" />
                {sent ? ` ${submitSendingLabel}` : ` ${submitLabel}`}
              </button>
              {sent && (
                <span className="t321-mkt-contact__ok">
                  <i className="fas fa-check-circle" /> {successText}
                </span>
              )}
            </div>
          </form>
        </div>
      </section>

      <section className="t321-mkt-section t321-mkt-section--sunk">
        <div className="t321-mkt-container">
          <div className="t321-mkt-section__head">
            <span className="t321-mkt-eyebrow"><i className={faqIcon} /> {faqEyebrow}</span>
            <h2 className="t321-mkt-h2">{faqHeading}</h2>
          </div>
          <div className="t321-mkt-contact__quickfaq">
            {faqs.map((q, i) => (
              <details key={i} className="t321-mkt-contact__qa">
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
    </div>
  );
}
