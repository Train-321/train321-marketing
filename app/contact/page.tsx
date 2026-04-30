"use client";

import Link from "next/link";
import { useState } from "react";
import "./contact.css";

const QUICK_FAQS = [
  {
    q: "I can't log in",
    a: "Try a password reset first — it sends a link to your email in under a minute. If the email doesn't arrive, check spam, then email support@train321.com with your username and we'll help within 2 business hours."
  },
  {
    q: "I need a copy of my certificate",
    a: "Log in to your account and go to Certificates — every certificate you've earned is there as a PDF. If you can't log in, email support@train321.com with the email you used when you enrolled."
  },
  {
    q: "I enrolled someone by mistake",
    a: "If the learner hasn't started the course, we can transfer the seat at no cost. Email support@train321.com with both names."
  },
  {
    q: "I need a receipt for accounting",
    a: "All receipts are in your dashboard under Billing. For corporate accounts, we also email a monthly summary to your admin contact."
  }
];

const EMPTY_FORM = { name: "", email: "", company: "", topic: "", message: "" };

export default function ContactPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setForm(EMPTY_FORM);
    }, 4000);
  };

  const update = (key: keyof typeof EMPTY_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="t321-mkt-contact">
      <section className="t321-mkt-contact__hero">
        <div className="t321-mkt-container">
          <span className="t321-mkt-eyebrow"><i className="fas fa-comments" /> Get in touch</span>
          <h1 className="t321-mkt-h1">We&apos;d love to hear from you.</h1>
          <p className="t321-mkt-lede">
            Real humans. Real answers. Typical reply in under two hours during business hours.
          </p>
        </div>
      </section>

      <section className="t321-mkt-section">
        <div className="t321-mkt-container t321-mkt-contact__grid">
          <aside className="t321-mkt-contact__side">
            <div className="t321-mkt-contact__tile t321-mkt-card">
              <span className="t321-mkt-contact__tile-icon t321-mkt-contact__tile-icon--accent"><i className="fas fa-phone" /></span>
              <strong>Call us</strong>
              <a href="tel:+15613257300">561-325-7300</a>
              <small>Mon-Fri · 7am-7pm CT</small>
            </div>
            <div className="t321-mkt-contact__tile t321-mkt-card">
              <span className="t321-mkt-contact__tile-icon t321-mkt-contact__tile-icon--positive"><i className="fas fa-envelope" /></span>
              <strong>Email us</strong>
              <a href="mailto:info@train321.com">info@train321.com</a>
              <small>Typical reply · under 2 hrs</small>
            </div>
            <div className="t321-mkt-contact__tile t321-mkt-card">
              <span className="t321-mkt-contact__tile-icon t321-mkt-contact__tile-icon--warn"><i className="fas fa-comment-dots" /></span>
              <strong>Live chat</strong>
              <a href="#" onClick={(e) => e.preventDefault()}>Start a conversation</a>
              <small>Avg wait · 42 sec</small>
            </div>
            <div className="t321-mkt-contact__tile t321-mkt-card">
              <span className="t321-mkt-contact__tile-icon t321-mkt-contact__tile-icon--purple"><i className="fas fa-book-open" /></span>
              <strong>Browse FAQs</strong>
              <Link href="/faq">50+ answers</Link>
              <small>Certificates, refunds, billing</small>
            </div>
          </aside>

          <form className="t321-mkt-contact__form" onSubmit={onSubmit}>
            <h2 className="t321-mkt-h2">Send us a message</h2>
            <p className="t321-mkt-lede">
              Fill out the form below and the right person on our team will pick it up.
            </p>

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
                  <option value="sales">Sales &amp; pricing</option>
                  <option value="support">Account support</option>
                  <option value="certificate">Certificate issue</option>
                  <option value="billing">Billing question</option>
                  <option value="custom">Custom / white-label</option>
                  <option value="press">Press</option>
                  <option value="other">Other</option>
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
                {sent ? " Message sent" : " Send message"}
              </button>
              {sent && (
                <span className="t321-mkt-contact__ok">
                  <i className="fas fa-check-circle" /> We&apos;ll reply within 2 business hours.
                </span>
              )}
            </div>
          </form>
        </div>
      </section>

      <section className="t321-mkt-section t321-mkt-section--sunk">
        <div className="t321-mkt-container">
          <div className="t321-mkt-section__head">
            <span className="t321-mkt-eyebrow"><i className="fas fa-question-circle" /> Quick answers</span>
            <h2 className="t321-mkt-h2">The things most people ask first</h2>
          </div>
          <div className="t321-mkt-contact__quickfaq">
            {QUICK_FAQS.map((q, i) => (
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
