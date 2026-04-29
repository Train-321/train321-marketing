<template>
  <footer class="t321-mkt-footer">
    <div class="t321-mkt-container t321-mkt-footer__inner">
      <div class="t321-mkt-footer__brand">
        <NuxtLink to="/" class="t321-mkt-brand t321-mkt-brand--dark">
          <span class="t321-mkt-brand__mark" aria-hidden="true">
            <i class="fas fa-graduation-cap"></i>
          </span>
          <span class="t321-mkt-brand__word">
            Train<span class="t321-mkt-brand__accent">321</span>
          </span>
        </NuxtLink>
        <p class="t321-mkt-footer__tagline">
          Compliance training your team will actually finish. Built for restaurants, retailers,
          and service businesses that need certified staff — without the hassle.
        </p>
        <div class="t321-mkt-footer__social" aria-label="Social">
          <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noopener"><i class="fab fa-facebook-f"></i></a>
          <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noopener"><i class="fab fa-twitter"></i></a>
          <a href="https://linkedin.com" aria-label="LinkedIn" target="_blank" rel="noopener"><i class="fab fa-linkedin-in"></i></a>
          <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noopener"><i class="fab fa-instagram"></i></a>
          <a href="https://youtube.com" aria-label="YouTube" target="_blank" rel="noopener"><i class="fab fa-youtube"></i></a>
        </div>
      </div>

      <div class="t321-mkt-footer__col">
        <h4>Company</h4>
        <ul>
          <li v-for="l in footerNav.company" :key="l.to">
            <NuxtLink :to="l.to">{{ l.label }}</NuxtLink>
          </li>
        </ul>
      </div>

      <div class="t321-mkt-footer__col">
        <h4>Support</h4>
        <ul>
          <li v-for="l in footerNav.support" :key="l.to">
            <NuxtLink :to="l.to">{{ l.label }}</NuxtLink>
          </li>
        </ul>
      </div>

      <div class="t321-mkt-footer__col t321-mkt-footer__col--wide">
        <h4>Stay in the loop</h4>
        <p class="t321-mkt-footer__news-sub">
          Monthly tips on compliance deadlines, state-law changes, and training ROI.
        </p>
        <form class="t321-mkt-footer__news" @submit.prevent="onSubscribe">
          <label class="t321-mkt-footer__news-label" for="t321-footer-email">Email</label>
          <div class="t321-mkt-footer__news-wrap">
            <i class="fas fa-envelope" aria-hidden="true"></i>
            <input
              id="t321-footer-email"
              v-model="email"
              type="email"
              placeholder="you@work.com"
              autocomplete="email"
              required
            />
            <button type="submit" class="t321-mkt-btn t321-mkt-btn--primary">
              {{ subscribed ? 'Subscribed' : 'Subscribe' }}
            </button>
          </div>
          <p v-if="subscribed" class="t321-mkt-footer__news-ok">
            <i class="fas fa-check-circle" aria-hidden="true"></i>
            Thanks — you're on the list.
          </p>
        </form>
        <div class="t321-mkt-footer__contact">
          <a href="tel:+15613257300"><i class="fas fa-phone" aria-hidden="true"></i> 561-325-7300</a>
          <a href="mailto:info@train321.com"><i class="fas fa-envelope" aria-hidden="true"></i> info@train321.com</a>
        </div>
      </div>
    </div>

    <div class="t321-mkt-footer__meta">
      <div class="t321-mkt-container t321-mkt-footer__meta-inner">
        <span>&copy; {{ year }} Train321. All rights reserved.</span>
        <nav class="t321-mkt-footer__meta-nav" aria-label="Legal">
          <NuxtLink v-for="l in footerNav.legal" :key="l.to" :to="l.to">{{ l.label }}</NuxtLink>
        </nav>
      </div>
    </div>
  </footer>
</template>

<script>
import { footerNav } from "~/assets/data/nav";

export default {
  name: "MarketingFooter",
  data() {
    return {
      footerNav,
      email: "",
      subscribed: false,
      year: new Date().getFullYear()
    };
  },
  methods: {
    onSubscribe() {
      this.subscribed = true;
      setTimeout(() => { this.subscribed = false; this.email = ""; }, 2500);
    }
  }
};
</script>

<style scoped>
.t321-mkt-footer {
  background: #0F0F0E;
  color: #D7D1C4;
  margin-top: 4rem;
}
.t321-mkt-footer__inner {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr 1.8fr;
  gap: 2.25rem;
  padding: 3.5rem 1.5rem 2.5rem;
}

.t321-mkt-footer .t321-mkt-brand--dark { color: #ffffff; }
.t321-mkt-footer .t321-mkt-brand__mark {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #0C5AA8, #1579D1);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
}
.t321-mkt-footer .t321-mkt-brand__word {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #ffffff;
}
.t321-mkt-footer .t321-mkt-brand__accent { color: #74B5F2; }
.t321-mkt-footer .t321-mkt-brand {
  display: inline-flex; align-items: center; gap: 0.55rem; text-decoration: none;
}

.t321-mkt-footer__tagline {
  margin: 1rem 0 1.2rem;
  font-size: 0.9rem;
  line-height: 1.55;
  color: #A8A39A;
  max-width: 38ch;
}
.t321-mkt-footer__social {
  display: flex;
  gap: 0.5rem;
}
.t321-mkt-footer__social a {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  color: #D7D1C4;
  font-size: 0.82rem;
  text-decoration: none;
  transition: background 140ms ease, color 140ms ease, transform 140ms ease;
}
.t321-mkt-footer__social a:hover {
  background: #74B5F2;
  color: #0F0F0E;
  transform: translateY(-1px);
}

.t321-mkt-footer__col h4 {
  font-family: 'Fraunces', Georgia, serif;
  font-size: 0.95rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 1rem;
  letter-spacing: -0.01em;
}
.t321-mkt-footer__col ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
.t321-mkt-footer__col a {
  color: #A8A39A;
  text-decoration: none;
  font-size: 0.88rem;
  transition: color 120ms ease;
}
.t321-mkt-footer__col a:hover { color: #ffffff; }

.t321-mkt-footer__news-sub {
  margin: 0 0 0.8rem;
  font-size: 0.85rem;
  color: #A8A39A;
  line-height: 1.5;
}
.t321-mkt-footer__news-label {
  position: absolute;
  left: -9999px;
}
.t321-mkt-footer__news-wrap {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 0.2rem 0.2rem 0.2rem 0.85rem;
  gap: 0.5rem;
  transition: border-color 120ms ease, background 120ms ease;
}
.t321-mkt-footer__news-wrap:focus-within {
  background: rgba(255, 255, 255, 0.1);
  border-color: #74B5F2;
}
.t321-mkt-footer__news-wrap i {
  color: #A8A39A;
  font-size: 0.82rem;
}
.t321-mkt-footer__news-wrap input {
  flex: 1;
  background: transparent;
  border: 0;
  color: #ffffff;
  padding: 0.55rem 0.25rem;
  font-family: inherit;
  font-size: 0.9rem;
  min-width: 0;
  outline: none;
}
.t321-mkt-footer__news-wrap input::placeholder { color: #6E6C67; }
.t321-mkt-footer__news-wrap .t321-mkt-btn {
  padding: 0.55rem 1rem;
  background: #74B5F2;
  color: #0F0F0E;
  border: 0;
  border-radius: 7px;
  font-weight: 600;
  font-size: 0.82rem;
  cursor: pointer;
  transition: background 120ms ease;
}
.t321-mkt-footer__news-wrap .t321-mkt-btn:hover { background: #9ACBFF; }
.t321-mkt-footer__news-ok {
  margin: 0.55rem 0 0;
  font-size: 0.82rem;
  color: #74B5F2;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.t321-mkt-footer__contact {
  margin-top: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.t321-mkt-footer__contact a {
  color: #A8A39A;
  text-decoration: none;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}
.t321-mkt-footer__contact a:hover { color: #ffffff; }
.t321-mkt-footer__contact i { width: 14px; color: #74B5F2; }

.t321-mkt-footer__meta {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.t321-mkt-footer__meta-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 1.1rem 1.5rem;
  font-size: 0.8rem;
  color: #6E6C67;
  flex-wrap: wrap;
}
.t321-mkt-footer__meta-nav {
  display: flex;
  gap: 1.25rem;
  flex-wrap: wrap;
}
.t321-mkt-footer__meta-nav a {
  color: #A8A39A;
  text-decoration: none;
  transition: color 120ms ease;
}
.t321-mkt-footer__meta-nav a:hover { color: #ffffff; }

@media (max-width: 991.98px) {
  .t321-mkt-footer__inner {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
  .t321-mkt-footer__brand { grid-column: 1 / -1; }
  .t321-mkt-footer__col--wide { grid-column: 1 / -1; }
}
@media (max-width: 600px) {
  .t321-mkt-footer__inner {
    grid-template-columns: 1fr;
    padding: 2.5rem 1.25rem 2rem;
  }
  .t321-mkt-footer__meta-inner { justify-content: flex-start; }
}
</style>
