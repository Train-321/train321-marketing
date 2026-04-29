<template>
  <div class="t321-mkt-demo">
    <section class="t321-mkt-demo__hero">
      <div class="t321-mkt-container t321-mkt-demo__hero-grid">
        <div>
          <span class="t321-mkt-eyebrow"><i class="fas fa-play-circle"></i> Book a walkthrough</span>
          <h1 class="t321-mkt-h1">See Train321 with your courses already loaded.</h1>
          <p class="t321-mkt-lede">
            Pick a 20-minute slot. We'll share a screen, walk through the learner flow,
            the manager dashboard, and the reporting you'd use on day one — using sample
            data that matches your operation.
          </p>
          <ul class="t321-mkt-demo__hero-list">
            <li><i class="fas fa-check"></i> 20-minute live walkthrough</li>
            <li><i class="fas fa-check"></i> Real platform, not a slideshow</li>
            <li><i class="fas fa-check"></i> Custom pricing quote within 24 hours</li>
            <li><i class="fas fa-check"></i> No sales pressure — we just want a fit</li>
          </ul>
        </div>

        <form class="t321-mkt-demo__form" @submit.prevent="onSubmit">
          <h2 class="t321-mkt-h3">Request a time</h2>

          <div class="t321-mkt-demo__row">
            <label class="t321-mkt-demo__field">
              <span>Full name</span>
              <input v-model="form.name" type="text" required autocomplete="name" placeholder="Jane Doe" />
            </label>
            <label class="t321-mkt-demo__field">
              <span>Work email</span>
              <input v-model="form.email" type="email" required autocomplete="email" placeholder="you@work.com" />
            </label>
          </div>

          <div class="t321-mkt-demo__row">
            <label class="t321-mkt-demo__field">
              <span>Company</span>
              <input v-model="form.company" type="text" required autocomplete="organization" placeholder="Coastal Hospitality Group" />
            </label>
            <label class="t321-mkt-demo__field">
              <span>Team size</span>
              <select v-model="form.seats" required>
                <option value="" disabled>Pick a range</option>
                <option>1-10</option>
                <option>11-50</option>
                <option>51-200</option>
                <option>201-500</option>
                <option>500+</option>
              </select>
            </label>
          </div>

          <label class="t321-mkt-demo__field">
            <span>Which courses are you most interested in?</span>
            <div class="t321-mkt-demo__chips">
              <label v-for="opt in interestOptions" :key="opt" class="t321-mkt-demo__chip">
                <input type="checkbox" :value="opt" v-model="form.interests" />
                <span>{{ opt }}</span>
              </label>
            </div>
          </label>

          <label class="t321-mkt-demo__field">
            <span>Best time to meet</span>
            <select v-model="form.timeslot" required>
              <option value="" disabled>Choose a window</option>
              <option>Tomorrow morning (9am-12pm CT)</option>
              <option>Tomorrow afternoon (1pm-5pm CT)</option>
              <option>This week — flexible</option>
              <option>Next week — flexible</option>
              <option>Just send me a Calendly link</option>
            </select>
          </label>

          <label class="t321-mkt-demo__field">
            <span>Anything we should know?</span>
            <textarea v-model="form.notes" rows="3" placeholder="Deadline, specific audit, integration questions — optional."></textarea>
          </label>

          <button type="submit" class="t321-mkt-btn t321-mkt-btn--primary t321-mkt-btn--lg" :disabled="sent">
            <i class="fas fa-calendar-check" aria-hidden="true"></i>
            {{ sent ? 'Request received' : 'Book my demo' }}
          </button>
          <p v-if="sent" class="t321-mkt-demo__ok">
            <i class="fas fa-check-circle"></i> Thanks {{ form.name.split(' ')[0] }} — we'll email you within 2 business hours.
          </p>
          <p v-else class="t321-mkt-demo__disclaim">
            We'll never share your info. Expect a reply from a real human within 2 business hours.
          </p>
        </form>
      </div>
    </section>

    <section
      v-if="videosLoading || videos.length > 0"
      class="t321-mkt-section t321-mkt-demo__videos-section"
    >
      <div class="t321-mkt-container">
        <div class="t321-mkt-section__head">
          <span class="t321-mkt-eyebrow"><i class="fas fa-film"></i> See it in action</span>
          <h2 class="t321-mkt-h2">Watch a quick walkthrough</h2>
          <p class="t321-mkt-lede">
            Short clips from the actual learner and manager experience — tap any to play inline.
          </p>
        </div>

        <div v-if="videosLoading" class="t321-mkt-demo__videos" aria-hidden="true">
          <div v-for="n in 6" :key="n" class="t321-mkt-demo__video-card t321-mkt-demo__video-card--skel"></div>
        </div>

        <div v-else class="t321-mkt-demo__videos">
          <article v-for="v in videos" :key="v.id" class="t321-mkt-demo__video-card t321-mkt-card">
            <div class="t321-mkt-demo__video-frame">
              <button
                v-if="!v.playing"
                type="button"
                class="t321-mkt-demo__video-poster"
                :aria-label="'Play ' + v.name"
                @click="playVideo(v)"
              >
                <span class="t321-mkt-demo__video-play" aria-hidden="true">
                  <i class="fas fa-play"></i>
                </span>
                <span class="t321-mkt-demo__video-tag" aria-hidden="true">Demo</span>
              </button>
              <iframe
                v-else
                :src="'https://player.vimeo.com/video/' + v.id + '?autoplay=1&title=0&byline=0&portrait=0'"
                :title="v.name"
                frameborder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowfullscreen
                loading="lazy"
              ></iframe>
            </div>
            <div class="t321-mkt-demo__video-body">
              <h3 class="t321-mkt-h3">{{ v.name }}</h3>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="t321-mkt-section t321-mkt-section--sunk">
      <div class="t321-mkt-container">
        <div class="t321-mkt-section__head">
          <span class="t321-mkt-eyebrow"><i class="fas fa-route"></i> What we'll cover</span>
          <h2 class="t321-mkt-h2">The 20-minute agenda</h2>
        </div>
        <div class="t321-mkt-demo__agenda">
          <article v-for="(step, i) in agenda" :key="step.title" class="t321-mkt-demo__agenda-item t321-mkt-card">
            <span class="t321-mkt-demo__agenda-num">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="t321-mkt-demo__agenda-time">{{ step.time }}</span>
            <h3 class="t321-mkt-h3">{{ step.title }}</h3>
            <p>{{ step.desc }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="t321-mkt-section">
      <div class="t321-mkt-container">
        <div class="t321-mkt-section__head">
          <span class="t321-mkt-eyebrow"><i class="fas fa-question-circle"></i> Common questions</span>
          <h2 class="t321-mkt-h2">What people ask before the call</h2>
        </div>
        <div class="t321-mkt-demo__faqs">
          <details v-for="(q, i) in faqs" :key="i" class="t321-mkt-demo__faq">
            <summary>
              <span>{{ q.q }}</span>
              <i class="fas fa-plus" aria-hidden="true"></i>
            </summary>
            <p>{{ q.a }}</p>
          </details>
        </div>
      </div>
    </section>

    <section class="t321-mkt-section t321-mkt-section--ink">
      <div class="t321-mkt-container t321-mkt-demo__cta">
        <div>
          <h2 class="t321-mkt-h2">Rather just try it yourself?</h2>
          <p class="t321-mkt-lede">
            Any individual course is buyable in two clicks — no sales call required.
          </p>
        </div>
        <div class="t321-mkt-demo__cta-actions">
          <NuxtLink to="/catalog" class="t321-mkt-btn t321-mkt-btn--accent t321-mkt-btn--lg">
            Browse the catalog
            <i class="fas fa-arrow-right" aria-hidden="true"></i>
          </NuxtLink>
          <NuxtLink to="/contact" class="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg">
            Contact sales
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: "MarketingDemo",
  data() {
    return {
      form: {
        name: "",
        email: "",
        company: "",
        seats: "",
        interests: [],
        timeslot: "",
        notes: ""
      },
      sent: false,
      videos: [],
      videosLoading: true,
      interestOptions: [
        "Food Handler",
        "Food Manager",
        "Alcohol / TIPS",
        "Sexual Harassment",
        "Allergen Awareness",
        "Custom / SOP"
      ],
      agenda: [
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
      ],
      faqs: [
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
      ]
    };
  },
  mounted() {
    this.loadVideos();
  },
  methods: {
    onSubmit() {
      this.sent = true;
    },
    loadVideos() {
      if (typeof fetch !== "function") {
        this.videosLoading = false;
        return;
      }
      fetch("https://api.train321.com/tour/demovideos")
        .then(r => (r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))))
        .then(rows => {
          const list = Array.isArray(rows) ? rows : [];
          this.videos = list
            .filter(v => v && v.vimeo_video_id)
            .map(v => ({
              id: String(v.vimeo_video_id),
              name: v.name || "Walkthrough",
              playing: false
            }));
        })
        .catch(() => {
          this.videos = [];
        })
        .then(() => { this.videosLoading = false; });
    },
    playVideo(v) {
      this.$set(v, "playing", true);
    }
  }
};
</script>

<style scoped>
.t321-mkt-demo__hero {
  padding: 3rem 0 3.5rem;
  background: linear-gradient(180deg, var(--t321-mkt-paper) 0%, var(--t321-mkt-paper-sunk) 100%);
  border-bottom: 1px solid var(--t321-mkt-line);
}
.t321-mkt-demo__hero-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;
}
.t321-mkt-demo__hero .t321-mkt-h1 { max-width: 18ch; }
.t321-mkt-demo__hero-list {
  list-style: none;
  padding: 0;
  margin: 1.5rem 0 0;
  display: grid;
  gap: 0.6rem;
}
.t321-mkt-demo__hero-list li {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.95rem;
}
.t321-mkt-demo__hero-list i {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--t321-mkt-positive-wash);
  color: var(--t321-mkt-positive);
  font-size: 0.7rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.t321-mkt-demo__form {
  background: #ffffff;
  border: 1px solid var(--t321-mkt-line);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 12px 32px rgba(15, 15, 14, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.t321-mkt-demo__form .t321-mkt-h3 { margin-bottom: 0.25rem; }

.t321-mkt-demo__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.t321-mkt-demo__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.t321-mkt-demo__field > span {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--t321-mkt-ink-muted);
  letter-spacing: 0.02em;
}
.t321-mkt-demo__field input,
.t321-mkt-demo__field select,
.t321-mkt-demo__field textarea {
  padding: 0.7rem 0.9rem;
  border: 1.5px solid var(--t321-mkt-line);
  border-radius: 10px;
  background: var(--t321-mkt-paper);
  font-family: inherit;
  font-size: 0.95rem;
  color: var(--t321-mkt-ink);
  transition: border-color 120ms ease, background 120ms ease;
}
.t321-mkt-demo__field input:focus,
.t321-mkt-demo__field select:focus,
.t321-mkt-demo__field textarea:focus {
  outline: none;
  border-color: var(--t321-mkt-accent);
  background: #ffffff;
}
.t321-mkt-demo__field textarea { resize: vertical; min-height: 90px; }

.t321-mkt-demo__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
.t321-mkt-demo__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  border: 1.5px solid var(--t321-mkt-line);
  background: #ffffff;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background 120ms ease, border-color 120ms ease, color 120ms ease;
}
.t321-mkt-demo__chip input { accent-color: var(--t321-mkt-accent); }
.t321-mkt-demo__chip:has(input:checked) {
  background: var(--t321-mkt-accent-wash);
  border-color: var(--t321-mkt-accent);
  color: var(--t321-mkt-accent);
}

.t321-mkt-demo__ok {
  margin: 0;
  font-size: 0.88rem;
  color: var(--t321-mkt-positive);
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}
.t321-mkt-demo__disclaim {
  margin: 0;
  font-size: 0.78rem;
  color: var(--t321-mkt-ink-muted);
}

/* Video demos */
.t321-mkt-demo__videos-section { padding-top: 3.5rem; padding-bottom: 3.5rem; }
.t321-mkt-demo__videos {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}
.t321-mkt-demo__video-card {
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border: 1px solid var(--t321-mkt-line);
  border-radius: 14px;
  transition: transform 200ms ease, box-shadow 200ms ease;
}
.t321-mkt-demo__video-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 22px 48px -20px rgba(15, 15, 14, 0.18);
}
.t321-mkt-demo__video-frame {
  position: relative;
  aspect-ratio: 16 / 9;
  background: linear-gradient(135deg, #0B437C 0%, #0B437C 45%, #00CCFE 130%);
  overflow: hidden;
}
.t321-mkt-demo__video-frame iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}
.t321-mkt-demo__video-poster {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  cursor: pointer;
  padding: 0;
  background:
    radial-gradient(420px 220px at 65% 30%, rgba(255, 255, 255, 0.18), transparent 70%),
    linear-gradient(135deg, #0B437C 0%, #0B437C 45%, #00CCFE 130%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 200ms ease;
}
.t321-mkt-demo__video-poster::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, transparent 35%, rgba(0, 0, 0, 0.18) 100%);
}
.t321-mkt-demo__video-play {
  position: relative;
  z-index: 1;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.96);
  color: var(--t321-mkt-accent);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.15rem;
  box-shadow: 0 12px 32px -8px rgba(15, 15, 14, 0.4);
  transition: transform 220ms ease, box-shadow 220ms ease;
}
.t321-mkt-demo__video-play i { margin-left: 4px; }
.t321-mkt-demo__video-poster:hover .t321-mkt-demo__video-play {
  transform: scale(1.08);
  box-shadow: 0 18px 40px -6px rgba(15, 15, 14, 0.45);
}
.t321-mkt-demo__video-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 1;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #ffffff;
  background: rgba(0, 0, 0, 0.35);
}
.t321-mkt-demo__video-body { padding: 1rem 1.25rem 1.15rem; }
.t321-mkt-demo__video-body h3 {
  margin: 0;
  font-size: 1rem;
  line-height: 1.4;
}

.t321-mkt-demo__video-card--skel {
  height: 260px;
  position: relative;
  overflow: hidden;
  background: var(--t321-mkt-paper-sunk);
}
.t321-mkt-demo__video-card--skel::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.55) 50%, transparent 100%);
  animation: t321DemoSkel 1.4s ease-in-out infinite;
}
@keyframes t321DemoSkel {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.t321-mkt-demo__agenda {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}
.t321-mkt-demo__agenda-item {
  padding: 1.5rem;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.t321-mkt-demo__agenda-num {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--t321-mkt-accent);
  letter-spacing: -0.02em;
}
.t321-mkt-demo__agenda-time {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--t321-mkt-ink-muted);
  font-weight: 600;
}
.t321-mkt-demo__agenda-item h3 { margin: 0.25rem 0 0; }
.t321-mkt-demo__agenda-item p {
  margin: 0.3rem 0 0;
  font-size: 0.88rem;
  color: var(--t321-mkt-ink-muted);
  line-height: 1.55;
}

.t321-mkt-demo__faqs {
  max-width: 760px;
  margin: 0 auto;
}
.t321-mkt-demo__faq {
  background: #ffffff;
  border: 1px solid var(--t321-mkt-line);
  border-radius: 12px;
  margin-bottom: 0.6rem;
  transition: border-color 140ms ease;
}
.t321-mkt-demo__faq[open] { border-color: var(--t321-mkt-accent); }
.t321-mkt-demo__faq summary {
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.95rem;
}
.t321-mkt-demo__faq summary::-webkit-details-marker { display: none; }
.t321-mkt-demo__faq summary i {
  color: var(--t321-mkt-accent);
  transition: transform 200ms ease;
}
.t321-mkt-demo__faq[open] summary i { transform: rotate(45deg); }
.t321-mkt-demo__faq p {
  margin: 0;
  padding: 0 1.25rem 1.1rem;
  font-size: 0.92rem;
  color: var(--t321-mkt-ink-muted);
  line-height: 1.6;
}

.t321-mkt-demo__cta {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2rem;
  align-items: center;
}
.t321-mkt-demo__cta-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

@media (max-width: 991.98px) {
  .t321-mkt-demo__hero-grid { grid-template-columns: 1fr; gap: 2rem; }
  .t321-mkt-demo__agenda { grid-template-columns: repeat(2, 1fr); }
  .t321-mkt-demo__videos { grid-template-columns: repeat(2, 1fr); }
  .t321-mkt-demo__cta { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .t321-mkt-demo__row { grid-template-columns: 1fr; }
  .t321-mkt-demo__agenda { grid-template-columns: 1fr; }
  .t321-mkt-demo__videos { grid-template-columns: 1fr; }
  .t321-mkt-demo__form { padding: 1.5rem; }
}
</style>
