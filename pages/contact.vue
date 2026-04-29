<template>
  <div class="t321-mkt-contact">
    <section class="t321-mkt-contact__hero">
      <div class="t321-mkt-container">
        <span class="t321-mkt-eyebrow"><i class="fas fa-comments"></i> Get in touch</span>
        <h1 class="t321-mkt-h1">We'd love to hear from you.</h1>
        <p class="t321-mkt-lede">
          Real humans. Real answers. Typical reply in under two hours during business hours.
        </p>
      </div>
    </section>

    <section class="t321-mkt-section">
      <div class="t321-mkt-container t321-mkt-contact__grid">
        <aside class="t321-mkt-contact__side">
          <div class="t321-mkt-contact__tile t321-mkt-card">
            <span class="t321-mkt-contact__tile-icon t321-mkt-contact__tile-icon--accent"><i class="fas fa-phone"></i></span>
            <strong>Call us</strong>
            <a href="tel:+15613257300">561-325-7300</a>
            <small>Mon-Fri · 7am-7pm CT</small>
          </div>
          <div class="t321-mkt-contact__tile t321-mkt-card">
            <span class="t321-mkt-contact__tile-icon t321-mkt-contact__tile-icon--positive"><i class="fas fa-envelope"></i></span>
            <strong>Email us</strong>
            <a href="mailto:info@train321.com">info@train321.com</a>
            <small>Typical reply · under 2 hrs</small>
          </div>
          <div class="t321-mkt-contact__tile t321-mkt-card">
            <span class="t321-mkt-contact__tile-icon t321-mkt-contact__tile-icon--warn"><i class="fas fa-comment-dots"></i></span>
            <strong>Live chat</strong>
            <a href="#" @click.prevent>Start a conversation</a>
            <small>Avg wait · 42 sec</small>
          </div>
          <div class="t321-mkt-contact__tile t321-mkt-card">
            <span class="t321-mkt-contact__tile-icon t321-mkt-contact__tile-icon--purple"><i class="fas fa-book-open"></i></span>
            <strong>Browse FAQs</strong>
            <NuxtLink to="/faq">50+ answers</NuxtLink>
            <small>Certificates, refunds, billing</small>
          </div>
        </aside>

        <form class="t321-mkt-contact__form" @submit.prevent="onSubmit">
          <h2 class="t321-mkt-h2">Send us a message</h2>
          <p class="t321-mkt-lede">
            Fill out the form below and the right person on our team will pick it up.
          </p>

          <div class="t321-mkt-contact__row">
            <label class="t321-mkt-contact__field">
              <span>Your name</span>
              <input v-model="form.name" type="text" required autocomplete="name" placeholder="Jane Doe" />
            </label>
            <label class="t321-mkt-contact__field">
              <span>Email</span>
              <input v-model="form.email" type="email" required autocomplete="email" placeholder="you@work.com" />
            </label>
          </div>

          <div class="t321-mkt-contact__row">
            <label class="t321-mkt-contact__field">
              <span>Company</span>
              <input v-model="form.company" type="text" autocomplete="organization" placeholder="Coastal Hospitality Group" />
            </label>
            <label class="t321-mkt-contact__field">
              <span>How can we help?</span>
              <select v-model="form.topic" required>
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

          <label class="t321-mkt-contact__field">
            <span>Message</span>
            <textarea v-model="form.message" rows="5" required placeholder="Tell us a bit about what you need — team size, timeline, anything that helps us reply quickly."></textarea>
          </label>

          <div class="t321-mkt-contact__actions">
            <button type="submit" class="t321-mkt-btn t321-mkt-btn--primary t321-mkt-btn--lg" :disabled="sent">
              <i class="fas fa-paper-plane" aria-hidden="true"></i>
              {{ sent ? 'Message sent' : 'Send message' }}
            </button>
            <span v-if="sent" class="t321-mkt-contact__ok">
              <i class="fas fa-check-circle"></i> We'll reply within 2 business hours.
            </span>
          </div>
        </form>
      </div>
    </section>

    <section class="t321-mkt-section t321-mkt-section--sunk">
      <div class="t321-mkt-container">
        <div class="t321-mkt-section__head">
          <span class="t321-mkt-eyebrow"><i class="fas fa-question-circle"></i> Quick answers</span>
          <h2 class="t321-mkt-h2">The things most people ask first</h2>
        </div>
        <div class="t321-mkt-contact__quickfaq">
          <details v-for="(q, i) in quickFaqs" :key="i" class="t321-mkt-contact__qa">
            <summary>
              <span>{{ q.q }}</span>
              <i class="fas fa-plus" aria-hidden="true"></i>
            </summary>
            <p>{{ q.a }}</p>
          </details>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "MarketingContact",
  data() {
    return {
      form: {
        name: "",
        email: "",
        company: "",
        topic: "",
        message: ""
      },
      sent: false,
      quickFaqs: [
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
      ]
    };
  },
  methods: {
    onSubmit() {
      this.sent = true;
      setTimeout(() => {
        this.sent = false;
        this.form = { name: "", email: "", company: "", topic: "", message: "" };
      }, 4000);
    }
  }
};
</script>

<style scoped>
.t321-mkt-contact__hero {
  padding: 3rem 0 2rem;
  background: linear-gradient(180deg, var(--t321-mkt-paper) 0%, var(--t321-mkt-paper-sunk) 100%);
  border-bottom: 1px solid var(--t321-mkt-line);
}
.t321-mkt-contact__grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 2.5rem;
  align-items: start;
}
.t321-mkt-contact__side {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.t321-mkt-contact__tile {
  display: grid;
  grid-template-columns: 48px 1fr;
  grid-template-rows: auto auto auto;
  gap: 0.25rem 1rem;
  padding: 1.1rem 1.25rem;
}
.t321-mkt-contact__tile-icon {
  grid-row: 1 / 4;
  align-self: start;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}
.t321-mkt-contact__tile-icon--accent { background: var(--t321-mkt-accent-wash); color: var(--t321-mkt-accent); }
.t321-mkt-contact__tile-icon--positive { background: var(--t321-mkt-positive-wash); color: var(--t321-mkt-positive); }
.t321-mkt-contact__tile-icon--warn { background: var(--t321-mkt-warn-wash); color: var(--t321-mkt-warn); }
.t321-mkt-contact__tile-icon--purple { background: var(--t321-mkt-purple-wash); color: var(--t321-mkt-purple); }
.t321-mkt-contact__tile strong {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--t321-mkt-ink);
}
.t321-mkt-contact__tile a {
  font-size: 0.9rem;
  color: var(--t321-mkt-accent);
  text-decoration: none;
  font-weight: 500;
}
.t321-mkt-contact__tile a:hover { text-decoration: underline; }
.t321-mkt-contact__tile small {
  font-size: 0.76rem;
  color: var(--t321-mkt-ink-muted);
}

.t321-mkt-contact__form {
  background: #ffffff;
  border: 1px solid var(--t321-mkt-line);
  border-radius: 16px;
  padding: 2.25rem;
  box-shadow: 0 8px 24px rgba(15, 15, 14, 0.04);
}
.t321-mkt-contact__form .t321-mkt-h2 { margin-bottom: 0.3rem; }
.t321-mkt-contact__form .t321-mkt-lede { margin-bottom: 1.5rem; font-size: 0.95rem; }

.t321-mkt-contact__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}
.t321-mkt-contact__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1rem;
}
.t321-mkt-contact__row .t321-mkt-contact__field { margin-bottom: 0; }
.t321-mkt-contact__field > span {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--t321-mkt-ink-muted);
  letter-spacing: 0.02em;
}
.t321-mkt-contact__field input,
.t321-mkt-contact__field select,
.t321-mkt-contact__field textarea {
  padding: 0.7rem 0.9rem;
  border: 1.5px solid var(--t321-mkt-line);
  border-radius: 10px;
  background: var(--t321-mkt-paper);
  font-family: inherit;
  font-size: 0.95rem;
  color: var(--t321-mkt-ink);
  transition: border-color 120ms ease, background 120ms ease;
}
.t321-mkt-contact__field input:focus,
.t321-mkt-contact__field select:focus,
.t321-mkt-contact__field textarea:focus {
  outline: none;
  border-color: var(--t321-mkt-accent);
  background: #ffffff;
}
.t321-mkt-contact__field textarea {
  resize: vertical;
  min-height: 120px;
}

.t321-mkt-contact__actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.25rem;
  flex-wrap: wrap;
}
.t321-mkt-contact__ok {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.88rem;
  color: var(--t321-mkt-positive);
}

.t321-mkt-contact__quickfaq {
  max-width: 720px;
  margin: 0 auto;
}
.t321-mkt-contact__qa {
  background: #ffffff;
  border: 1px solid var(--t321-mkt-line);
  border-radius: 12px;
  margin-bottom: 0.6rem;
  transition: border-color 140ms ease;
}
.t321-mkt-contact__qa[open] { border-color: var(--t321-mkt-accent); }
.t321-mkt-contact__qa summary {
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.95rem;
}
.t321-mkt-contact__qa summary::-webkit-details-marker { display: none; }
.t321-mkt-contact__qa summary i {
  color: var(--t321-mkt-accent);
  transition: transform 200ms ease;
}
.t321-mkt-contact__qa[open] summary i { transform: rotate(45deg); }
.t321-mkt-contact__qa p {
  margin: 0;
  padding: 0 1.25rem 1.1rem;
  font-size: 0.92rem;
  color: var(--t321-mkt-ink-muted);
  line-height: 1.6;
}

@media (max-width: 991.98px) {
  .t321-mkt-contact__grid { grid-template-columns: 1fr; }
  .t321-mkt-contact__side {
    flex-direction: row;
    flex-wrap: wrap;
  }
  .t321-mkt-contact__tile { flex: 1 1 calc(50% - 0.375rem); }
}
@media (max-width: 600px) {
  .t321-mkt-contact__row { grid-template-columns: 1fr; }
  .t321-mkt-contact__tile { flex-basis: 100%; }
  .t321-mkt-contact__form { padding: 1.5rem; }
}
</style>
