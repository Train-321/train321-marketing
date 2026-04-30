# Train321 Marketing Site

Standalone marketing site for **train321.com**. Built with **Next.js 15** (App Router) + **TinaCMS** (Markdown/JSON in git), deployed to **Vercel**.

The LMS app lives in a separate repo and is reached via Sign In / Enroll buttons that link to the app subdomain.

---

## Quick start

```bash
npm install
npm run dev
# → http://localhost:3000
```

That's it. All content lives in `content/` — no external CMS required to run the site.

---

## Stack

| | |
|---|---|
| Framework | Next.js 15, App Router, Turbopack |
| Routing | File-based (`app/`) |
| Styling | Custom CSS with design tokens (`app/globals.css`) — no Tailwind |
| Fonts | Inter + Fraunces via `next/font/google` |
| Content | Markdown + JSON files in `content/` |
| CMS (editor) | TinaCMS schema in `tina/config.ts` (admin backend setup pending — see "Editor mode" below) |
| Hosting | Vercel (`train321-marketing.vercel.app`) |

---

## Project structure

```
.
├── app/                       # Next.js App Router pages
│   ├── page.tsx               # / (home — wraps <HomePage forcedAudience={null} />)
│   ├── individuals/page.tsx   # /individuals (same component, audience pinned to "self")
│   ├── catalog/               # client-rendered catalog with filters
│   ├── courses/[slug]/        # SSG course detail (18 prerendered)
│   ├── blog/                  # blog index + [slug] (5 posts)
│   ├── legal/[slug]/          # legal pages (6)
│   ├── about, contact, demo,  # simple pages
│   │   faq, services, testimonials/
│   ├── layout.tsx             # root layout: Header + main + Footer
│   └── globals.css            # design tokens + utility classes
├── components/
│   ├── SiteHeader.{tsx,css}   # sticky nav, mobile drawer
│   ├── SiteFooter.{tsx,css}   # 4-col footer + meta bar
│   └── HomePage.{tsx,css}     # the home implementation (used by / and /individuals)
├── lib/
│   ├── content.ts             # server-only readers: getCourse(), getBlogPost(), etc.
│   └── nav.ts                 # primary + footer nav data (typed)
├── content/                   # ALL EDITABLE CONTENT
│   ├── courses/<slug>.json    # 18 courses
│   ├── blog/<slug>.md         # 5 blog posts (frontmatter + markdown body)
│   ├── legal/<slug>.md        # 6 legal pages
│   ├── faqs/<group>.json      # 4 FAQ groups
│   ├── testimonials/<id>.json # 5 testimonials
│   ├── team/<name>.json       # 6 team members
│   └── site/index.json        # singleton: phone, email, social, company stats, trust logos
├── tina/
│   └── config.ts              # TinaCMS collection schemas (drives the future editor UI)
├── scripts/
│   └── migrate-to-content.mjs # one-shot migration that built content/ from the old assets/data/
├── public/img/                # logos and static images
└── next.config.ts             # 24 permanent redirects from legacy /food-handler etc → /courses/...
```

---

## Editing content

For now, content is edited as files in this repo. Two ways:

1. **Locally**: edit `content/<collection>/<slug>.{json,md}` in VS Code, commit, push → Vercel rebuilds in ~30 seconds.
2. **GitHub web**: navigate to `Train-321/train321-marketing/content/...`, click the pencil icon, edit, commit on a branch or directly to main.

Schemas in `tina/config.ts` document the expected fields per collection — if a JSON or Markdown file goes out of shape, the next page render will surface a TypeScript error in `lib/content.ts`.

### Editor mode (TinaCMS visual editing) — pending

The Tina schema is in place. To turn on the click-on-page editor:

1. Sign up at https://app.tina.io/ (free tier covers solo/small teams).
2. Create a project pointed at this GitHub repo. Tina will give you `NEXT_PUBLIC_TINA_CLIENT_ID` and a backend `TINA_TOKEN`.
3. Paste both into Vercel env vars (and locally into `.env`).
4. Add the Tina build step to package.json: `"build": "tinacms build && next build"` and `"dev": "tinacms dev -c \"next dev\""`.
5. Add `app/admin-route/[[...slug]]/page.tsx` that statically serves the Tina admin from `public/admin/`.
6. Wire pages to use Tina's `client.queries.*` for live preview (optional — pages currently read directly from disk via `lib/content.ts`, which works fine for SSG).

Alternative: self-host the Tina backend on Vercel functions per https://tina.io/docs/self-hosted/. More setup, no SaaS dependency. Either works.

---

## Routes

| Route | Render | Source |
|---|---|---|
| `/` | client | `components/HomePage.tsx` |
| `/individuals` | client | same component, `forcedAudience="self"` |
| `/catalog` | client (data SSR'd) | `content/courses/*.json` |
| `/courses/[slug]` | SSG | `content/courses/<slug>.json`, 18 prebuilt |
| `/blog` | client (data SSR'd) | `content/blog/*.md` |
| `/blog/[slug]` | SSG | `content/blog/<slug>.md`, 5 prebuilt |
| `/legal/[slug]` | SSG | `content/legal/<slug>.md`, 6 prebuilt |
| `/about` | server | `content/team/*.json`, `content/site/index.json` |
| `/contact` | client | inline (form state) |
| `/demo` | client | inline |
| `/services` | server | inline (3 tiers) |
| `/faq` | client (data SSR'd) | `content/faqs/*.json` |
| `/testimonials` | server | `content/testimonials/*.json` |

Plus 24 `/<legacy-slug>` → `/courses/<slug>` or `/legal/<slug>` permanent redirects in `next.config.ts`.

---

## Deploying

The repo is connected to Vercel. Pushing to `main` triggers a build automatically. Build = `next build`, output = `.next/`.

Production env vars set on Vercel:
- `SITE_URL` — `https://train321-marketing.vercel.app`
- `NEXT_PUBLIC_APP_BASE` — `https://lms.train321.com`
- `API_BASE` — `https://api.train321.com`

When TinaCloud is wired:
- `NEXT_PUBLIC_TINA_CLIENT_ID`
- `TINA_TOKEN`
- `TINA_SEARCH_TOKEN` (if using Tina search)

---

## History

- **Original**: Nuxt 3 + Sanity (preserved on `nuxt-archive` branch).
- **Migrated to**: Next.js 15 + content-in-git, with a TinaCMS schema ready to wire when the editor backend is set up.
- **Why**: Visual editing via Sanity Presentation hit a Dashboard wrapper compat issue. TinaCMS doesn't support Vue, so the runtime moved to React (Next.js) which Tina supports natively. Content moved from a hosted SaaS to git-tracked Markdown/JSON for full ownership.

---

## License

Private — Train321 internal.
