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

### Local dev (works out of the box, no external services)

```bash
npm run dev
```

This runs `tinacms dev -c "next dev"` — the Tina admin and Next.js dev server boot together. Open:

- http://localhost:3000 → live site
- http://localhost:3000/admin/index.html → Tina admin (no login required in local mode)

In local mode, edits made through the admin UI write directly to the `content/` files on disk. Commit them when you're happy.

### Edit straight in git

Without booting Tina, you can also just edit `content/<collection>/<slug>.{json,md}` in VS Code or via the GitHub web editor → commit → push → Vercel rebuilds in ~30 seconds.

Schemas in `tina/config.ts` document the expected fields per collection.

---

## Editor mode (self-hosted production)

The Tina backend is set up to run on Vercel functions. The schema is wired,
the API routes exist, the admin UI is built. To turn it on in production
you need three external services. Each is free for the scale of this site.

### 1. MongoDB Atlas (the data layer index)

Tina uses MongoDB to index content for fast queries.

1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create a project, then create an **M0 (free)** cluster
3. **Network Access** → Add IP `0.0.0.0/0` (allow from anywhere — Vercel functions don't have static IPs on the Hobby tier; lock down later if you switch to a Pro plan)
4. **Database Access** → Add a database user with read+write permissions
5. **Database** → Connect → Drivers → copy the connection string. It looks like `mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`. **Replace `<password>` with the user's password URL-encoded.**
6. Paste it as `MONGODB_URI` in Vercel env vars

### 2. GitHub fine-grained PAT (the git provider)

Tina commits content edits to this repo via the GitHub API.

1. Go to https://github.com/settings/personal-access-tokens/new
2. **Resource owner**: `Train-321`. **Repository access**: only `train321-marketing`
3. **Permissions** → **Repository permissions**:
   - Contents: Read and write
   - Metadata: Read-only (auto)
4. Generate, copy the token, paste as `GITHUB_PERSONAL_ACCESS_TOKEN` in Vercel env vars
5. Also set `GITHUB_OWNER=Train-321` and `GITHUB_REPO=train321-marketing`

### 3. NextAuth secret (session cookies)

Generate a random 32-char string:

```bash
openssl rand -base64 32
```

Paste as `NEXTAUTH_SECRET` in Vercel env vars. Also set `NEXTAUTH_URL=https://train321-marketing.vercel.app` (whatever the prod URL is).

### 4. Deploy

After setting all the env vars on Vercel:

1. **Unset** `TINA_PUBLIC_IS_LOCAL` on Vercel (or set to `false`). Local mode disables auth and skips the production backend — you don't want that in prod.
2. Trigger a redeploy: `vercel deploy --prod` or push any commit.
3. The build runs `tinacms build && next build`. Tina creates the GraphQL schema, indexes content into MongoDB, and outputs the admin UI to `public/admin/`.

### 5. Create the first editor user

1. Visit `https://train321-marketing.vercel.app/admin/index.html`
2. The first time, you'll see a sign-up screen (Tina detects the empty user collection and lets you register).
3. Create your username/password. This commits a new file to `content/users/` with a hashed password.
4. Subsequent users can be added through the same flow until you decide to lock signup down.

After login, the admin UI lets you browse and edit every collection. Saving an edit commits to the GitHub repo via the PAT, which triggers a Vercel rebuild — content goes live in ~30 seconds.

### Visual editing per page (optional next step)

Right now pages read content via `lib/content.ts` (server filesystem). To get
**click-on-the-page-to-edit** in production, each page needs to switch from
`getCourse(slug)` etc. to `client.queries.course({ relativePath })` from the
generated Tina client at `tina/__generated__/client.ts`, plus wrap the JSX in
the `useTina` hook. This is page-by-page work; the schema and backend are
already correct. See `tina/__generated__/client.ts` for the generated query
helpers and https://tina.io/docs/data-fetching/overview for the pattern.

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
