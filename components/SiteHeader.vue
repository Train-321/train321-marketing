<template>
  <header class="t321-mkt-header" :class="{ 'is-scrolled': scrolled }">
    <a href="#main" class="t321-mkt-header__skip">Skip to main content</a>

    <div class="t321-mkt-header__utility">
      <div class="t321-mkt-container t321-mkt-header__utility-inner">
        <a class="t321-mkt-header__util-link" href="tel:+15613257300">
          <i class="fas fa-phone" aria-hidden="true"></i> 561-325-7300
        </a>
        <a class="t321-mkt-header__util-link" href="mailto:info@train321.com">
          <i class="fas fa-envelope" aria-hidden="true"></i> info@train321.com
        </a>
        <span class="t321-mkt-header__util-spacer" aria-hidden="true"></span>
        <NuxtLink
          :to="audienceLink.to"
          class="t321-mkt-header__util-link t321-mkt-header__util-link--accent"
        >
          <i class="fas fa-user-friends" aria-hidden="true"></i> {{ audienceLink.label }}
        </NuxtLink>
        <a
          :href="loginUrl"
          class="t321-mkt-header__util-link t321-mkt-header__util-link--btn"
        >
          <i class="fas fa-sign-in-alt" aria-hidden="true"></i> Sign in
        </a>
      </div>
    </div>

    <div class="t321-mkt-container t321-mkt-header__bar">
      <NuxtLink to="/" class="t321-mkt-brand" aria-label="Train 321 home">
        <img src="/img/logos/train321_logo.png" alt="Train321" class="t321-mkt-brand__logo" />
      </NuxtLink>

      <nav class="t321-mkt-nav" aria-label="Primary">
        <ul class="t321-mkt-nav__list">
          <li
            v-for="item in nav"
            :key="item.label"
            class="t321-mkt-nav__item"
            :class="{ 'has-children': item.children, 'is-open': openMenu === item.label }"
            @mouseenter="item.children && (openMenu = item.label)"
            @mouseleave="item.children && (openMenu = null)"
          >
            <NuxtLink
              v-if="!item.children"
              :to="item.to"
              class="t321-mkt-nav__link"
              :class="{ 'is-active': isActive(item.to) }"
            >{{ item.label }}</NuxtLink>
            <button
              v-else
              type="button"
              class="t321-mkt-nav__link t321-mkt-nav__link--btn"
              :aria-expanded="openMenu === item.label"
              @click="toggleMenu(item.label)"
            >
              {{ item.label }}
              <i class="fas fa-chevron-down t321-mkt-nav__caret" aria-hidden="true"></i>
            </button>

            <div v-if="item.children" class="t321-mkt-nav__menu" role="menu">
              <div v-for="group in item.children" :key="group.heading" class="t321-mkt-nav__group">
                <span class="t321-mkt-nav__group-head">{{ group.heading }}</span>
                <NuxtLink
                  v-for="link in group.links"
                  :key="link.to"
                  :to="link.to"
                  class="t321-mkt-nav__menu-link"
                  @click="openMenu = null"
                >
                  <i v-if="link.icon" :class="link.icon" aria-hidden="true"></i>
                  <span>{{ link.label }}</span>
                </NuxtLink>
              </div>
            </div>
          </li>
        </ul>
      </nav>

      <div class="t321-mkt-header__cta">
        <NuxtLink to="/catalog" class="t321-mkt-btn t321-mkt-btn--ghost">Browse courses</NuxtLink>
        <a :href="enrollUrl" class="t321-mkt-btn t321-mkt-btn--primary">
          Enroll now <i class="fas fa-arrow-right" aria-hidden="true"></i>
        </a>
      </div>

      <button
        type="button"
        class="t321-mkt-header__burger"
        :aria-expanded="drawerOpen"
        aria-label="Open navigation"
        @click="drawerOpen = true"
      >
        <i class="fas fa-bars" aria-hidden="true"></i>
      </button>
    </div>

    <Transition name="t321-mkt-drawer">
      <div v-if="drawerOpen" class="t321-mkt-drawer" role="dialog" aria-modal="true" aria-label="Menu">
        <button
          type="button"
          class="t321-mkt-drawer__scrim"
          aria-label="Close menu"
          @click="drawerOpen = false"
        ></button>
        <aside class="t321-mkt-drawer__panel">
          <div class="t321-mkt-drawer__head">
            <img src="/img/logos/train321_logo.png" alt="Train321" class="t321-mkt-brand__logo t321-mkt-brand__logo--sm" />
            <button
              type="button"
              class="t321-mkt-drawer__close"
              aria-label="Close"
              @click="drawerOpen = false"
            ><i class="fas fa-times" aria-hidden="true"></i></button>
          </div>
          <div class="t321-mkt-drawer__body">
            <template v-for="item in nav" :key="item.label">
              <NuxtLink
                v-if="!item.children"
                :to="item.to"
                class="t321-mkt-drawer__link"
                @click="drawerOpen = false"
              >{{ item.label }}</NuxtLink>
              <details v-else class="t321-mkt-drawer__group">
                <summary class="t321-mkt-drawer__summary">{{ item.label }}</summary>
                <div class="t321-mkt-drawer__sublist">
                  <div v-for="g in item.children" :key="g.heading">
                    <span class="t321-mkt-drawer__subhead">{{ g.heading }}</span>
                    <NuxtLink
                      v-for="link in g.links"
                      :key="link.to"
                      :to="link.to"
                      class="t321-mkt-drawer__sublink"
                      @click="drawerOpen = false"
                    >{{ link.label }}</NuxtLink>
                  </div>
                </div>
              </details>
            </template>
          </div>
          <div class="t321-mkt-drawer__foot">
            <a :href="enrollUrl" class="t321-mkt-btn t321-mkt-btn--primary t321-mkt-btn--block" @click="drawerOpen = false">
              Enroll now <i class="fas fa-arrow-right" aria-hidden="true"></i>
            </a>
            <a :href="loginUrl" class="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--block">
              Sign in
            </a>
          </div>
        </aside>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { marketingNav } from "~/assets/data/nav";

const route = useRoute();
const config = useRuntimeConfig();

const nav = marketingNav;
const openMenu = ref(null);
const drawerOpen = ref(false);
const scrolled = ref(false);

const appBase = computed(() => config.public.appBase || "/login");
const loginUrl = computed(() => `${appBase.value.replace(/\/$/, "")}/login`);
const enrollUrl = computed(() => "/enroll");

const audienceLink = computed(() =>
  route.path === "/individuals"
    ? { to: "/", label: "For teams" }
    : { to: "/individuals", label: "For individuals" }
);

function toggleMenu(label) {
  openMenu.value = openMenu.value === label ? null : label;
}

function isActive(to) {
  if (!to) return false;
  return route.path === to || route.path.startsWith(to + "/");
}

function onScroll() {
  scrolled.value = window.scrollY > 8;
}

watch(() => route.path, () => {
  drawerOpen.value = false;
  openMenu.value = null;
});

onMounted(() => {
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
});
</script>

<style scoped>
.t321-mkt-header {
  position: sticky;
  top: 0;
  z-index: 40;
  background: #ffffff;
  border-bottom: 1px solid var(--t321-mkt-line, #E8E4DB);
  transition: box-shadow 180ms ease;
}
.t321-mkt-header.is-scrolled {
  box-shadow: 0 6px 24px rgba(15, 15, 14, 0.06);
}
.t321-mkt-header__skip {
  position: absolute;
  left: -9999px;
  top: 0;
  background: #0F0F0E;
  color: #fff;
  padding: 0.5rem 0.85rem;
  z-index: 50;
  border-radius: 0 0 8px 0;
}
.t321-mkt-header__skip:focus { left: 0; }

.t321-mkt-header__utility {
  background: var(--t321-mkt-paper-sunk, #F2F0EA);
  border-bottom: 1px solid var(--t321-mkt-line, #E8E4DB);
  font-size: 0.78rem;
  color: var(--t321-mkt-ink-muted, #5E5C57);
}
.t321-mkt-header__utility-inner {
  display: flex;
  gap: 1.25rem;
  align-items: center;
  height: 34px;
}
.t321-mkt-header__util-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  color: inherit;
  text-decoration: none;
  transition: color 120ms ease;
}
.t321-mkt-header__util-link:hover { color: var(--t321-mkt-ink, #0F0F0E); }
.t321-mkt-header__util-link i { font-size: 0.72rem; }
.t321-mkt-header__util-link--btn {
  border: 0;
  padding: 0;
  background: transparent;
  font: inherit;
  cursor: pointer;
}
.t321-mkt-header__util-link--accent {
  color: var(--t321-mkt-accent, #0A427B);
  font-weight: 600;
}
.t321-mkt-header__util-link--accent:hover {
  color: var(--t321-mkt-accent-bright, #00CCFE);
}
.t321-mkt-header__util-spacer { flex: 1; }

.t321-mkt-header__bar {
  display: flex;
  align-items: center;
  gap: 2rem;
  height: 72px;
}

.t321-mkt-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  text-decoration: none;
  color: var(--t321-mkt-ink, #0F0F0E);
  flex-shrink: 0;
}
.t321-mkt-brand__logo {
  height: 44px;
  width: auto;
  display: block;
  object-fit: contain;
}
.t321-mkt-brand__logo--sm { height: 34px; }

.t321-mkt-nav {
  flex: 1;
  display: flex;
  justify-content: center;
}
.t321-mkt-nav__list {
  display: flex;
  gap: 0.2rem;
  list-style: none;
  margin: 0;
  padding: 0;
}
.t321-mkt-nav__item { position: relative; }
.t321-mkt-nav__link {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.6rem 0.85rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--t321-mkt-ink, #0F0F0E);
  text-decoration: none;
  background: transparent;
  border: 0;
  cursor: pointer;
  transition: background 120ms ease, color 120ms ease;
  font-family: inherit;
}
.t321-mkt-nav__link:hover,
.t321-mkt-nav__link.is-active {
  background: var(--t321-mkt-paper-sunk, #F2F0EA);
}
.t321-mkt-nav__caret { font-size: 0.65rem; transition: transform 180ms ease; }
.t321-mkt-nav__item.is-open .t321-mkt-nav__caret { transform: rotate(180deg); }

.t321-mkt-nav__menu {
  position: absolute;
  left: 50%;
  top: calc(100% + 6px);
  transform: translateX(-50%);
  min-width: 520px;
  background: #ffffff;
  border: 1px solid var(--t321-mkt-line, #E8E4DB);
  border-radius: 14px;
  padding: 1rem 1.1rem;
  display: none;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  box-shadow: 0 18px 40px rgba(15, 15, 14, 0.12);
}
.t321-mkt-nav__menu::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  top: -8px;
  height: 8px;
}
.t321-mkt-nav__item.is-open .t321-mkt-nav__menu { display: grid; }
.t321-mkt-nav__group-head {
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--t321-mkt-ink-muted, #5E5C57);
  display: block;
  padding: 0.3rem 0.5rem;
  margin-bottom: 0.25rem;
}
.t321-mkt-nav__menu-link {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.5rem 0.55rem;
  border-radius: 8px;
  text-decoration: none;
  color: var(--t321-mkt-ink, #0F0F0E);
  font-size: 0.88rem;
  transition: background 120ms ease;
}
.t321-mkt-nav__menu-link:hover { background: var(--t321-mkt-paper-sunk, #F2F0EA); }
.t321-mkt-nav__menu-link i {
  width: 22px;
  color: var(--t321-mkt-accent, #0A427B);
  font-size: 0.82rem;
}

.t321-mkt-header__cta {
  display: flex;
  gap: 0.55rem;
  align-items: center;
  flex-shrink: 0;
}

.t321-mkt-header__burger {
  display: none;
  border: 0;
  background: transparent;
  font-size: 1.2rem;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--t321-mkt-ink, #0F0F0E);
}

.t321-mkt-drawer {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
}
.t321-mkt-drawer__scrim {
  flex: 1;
  border: 0;
  background: rgba(15, 15, 14, 0.35);
  cursor: pointer;
}
.t321-mkt-drawer__panel {
  width: min(360px, 88vw);
  background: #ffffff;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-shadow: -8px 0 32px rgba(15, 15, 14, 0.15);
}
.t321-mkt-drawer__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--t321-mkt-line, #E8E4DB);
}
.t321-mkt-drawer__close {
  border: 0;
  background: transparent;
  font-size: 1.1rem;
  cursor: pointer;
  color: var(--t321-mkt-ink, #0F0F0E);
  padding: 0.4rem;
}
.t321-mkt-drawer__body {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem 0.9rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.t321-mkt-drawer__link,
.t321-mkt-drawer__summary {
  display: block;
  padding: 0.7rem 0.75rem;
  border-radius: 8px;
  color: var(--t321-mkt-ink, #0F0F0E);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  list-style: none;
}
.t321-mkt-drawer__summary::-webkit-details-marker { display: none; }
.t321-mkt-drawer__summary::after {
  content: "\f107";
  font-family: "Font Awesome 5 Free";
  font-weight: 900;
  float: right;
  font-size: 0.75rem;
  color: var(--t321-mkt-ink-muted, #5E5C57);
  transition: transform 180ms ease;
}
.t321-mkt-drawer__group[open] .t321-mkt-drawer__summary::after { transform: rotate(180deg); }
.t321-mkt-drawer__link:hover,
.t321-mkt-drawer__summary:hover { background: var(--t321-mkt-paper-sunk, #F2F0EA); }
.t321-mkt-drawer__sublist {
  padding: 0.25rem 0.5rem 0.5rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.t321-mkt-drawer__subhead {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--t321-mkt-ink-muted, #5E5C57);
  padding: 0 0.25rem;
}
.t321-mkt-drawer__sublink {
  display: block;
  padding: 0.45rem 0.5rem;
  border-radius: 6px;
  text-decoration: none;
  color: var(--t321-mkt-ink, #0F0F0E);
  font-size: 0.88rem;
}
.t321-mkt-drawer__sublink:hover { background: var(--t321-mkt-paper-sunk, #F2F0EA); }
.t321-mkt-drawer__foot {
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--t321-mkt-line, #E8E4DB);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.t321-mkt-drawer-enter-active, .t321-mkt-drawer-leave-active {
  transition: opacity 180ms ease;
}
.t321-mkt-drawer-enter-active .t321-mkt-drawer__panel,
.t321-mkt-drawer-leave-active .t321-mkt-drawer__panel {
  transition: transform 240ms cubic-bezier(0.22, 0.7, 0.2, 1);
}
.t321-mkt-drawer-enter-from, .t321-mkt-drawer-leave-to { opacity: 0; }
.t321-mkt-drawer-enter-from .t321-mkt-drawer__panel,
.t321-mkt-drawer-leave-to .t321-mkt-drawer__panel { transform: translateX(100%); }

@media (max-width: 991.98px) {
  .t321-mkt-nav,
  .t321-mkt-header__cta { display: none; }
  .t321-mkt-header__burger { display: inline-flex; margin-left: auto; }
  .t321-mkt-header__bar { height: 64px; gap: 1rem; }
}
@media (max-width: 600px) {
  .t321-mkt-header__utility-inner { gap: 0.85rem; font-size: 0.72rem; }
  .t321-mkt-header__util-link span { display: none; }
}
</style>
