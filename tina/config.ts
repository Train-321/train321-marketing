import { defineConfig } from "tinacms";

// Branch detection — Vercel sets these automatically
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

export default defineConfig({
  branch,
  // Self-hosted: leave clientId/token blank, point at our own backend.
  // For dev, the local file system is used directly.
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || "",
  token: process.env.TINA_TOKEN || "",

  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },

  media: {
    tina: {
      mediaRoot: "img",
      publicFolder: "public"
    }
  },

  schema: {
    collections: [
      // ── Site Settings (singleton) ──────────────────────────────────────
      {
        name: "siteSettings",
        label: "Site Settings",
        path: "content/site",
        format: "json",
        ui: {
          allowedActions: { create: false, delete: false }
        },
        fields: [
          { type: "string", name: "siteName", label: "Site name" },
          { type: "string", name: "tagline", label: "Tagline" },
          { type: "string", name: "phone", label: "Phone" },
          { type: "string", name: "email", label: "Email" },
          {
            type: "object",
            name: "social",
            label: "Social links",
            fields: [
              { type: "string", name: "facebook", label: "Facebook" },
              { type: "string", name: "twitter", label: "Twitter / X" },
              { type: "string", name: "linkedin", label: "LinkedIn" },
              { type: "string", name: "instagram", label: "Instagram" },
              { type: "string", name: "youtube", label: "YouTube" }
            ]
          },
          {
            type: "object",
            name: "companyStats",
            label: "Company stats",
            list: true,
            ui: { itemProps: (i) => ({ label: i?.value ? `${i.value} — ${i.label || ""}` : "Stat" }) },
            fields: [
              { type: "string", name: "value", label: "Value", required: true },
              { type: "string", name: "label", label: "Label", required: true }
            ]
          },
          {
            type: "object",
            name: "trustLogos",
            label: "Trust logos",
            list: true,
            ui: { itemProps: (i) => ({ label: i?.name || "Logo" }) },
            fields: [
              { type: "string", name: "name", label: "Short name", required: true },
              { type: "string", name: "label", label: "Long label" }
            ]
          }
        ]
      },

      // ── Courses ────────────────────────────────────────────────────────
      {
        name: "course",
        label: "Courses",
        path: "content/courses",
        format: "json",
        ui: {
          itemProps: (item) => ({ label: item?.title || "Untitled course" }),
          filename: { readonly: true, slugify: (v) => v.slug || "" }
        },
        fields: [
          { type: "string", name: "slug", label: "Slug", required: true, isTitle: false, ui: { component: "text" } },
          { type: "string", name: "title", label: "Title", required: true, isTitle: true },
          { type: "string", name: "eyebrow", label: "Eyebrow (small line above title)" },
          { type: "string", name: "tagline", label: "Tagline", ui: { component: "textarea" } },
          {
            type: "string",
            name: "category",
            label: "Category",
            options: [
              { value: "food", label: "Food" },
              { value: "alcohol", label: "Alcohol" },
              { value: "hr", label: "HR" }
            ]
          },
          {
            type: "string",
            name: "color",
            label: "Card accent color",
            options: ["amber", "plum", "emerald", "neutral"]
          },
          { type: "string", name: "icon", label: "Font Awesome icon class" },
          { type: "string", name: "image", label: "Image URL" },
          { type: "string", name: "summary", label: "Summary", ui: { component: "textarea" } },
          {
            type: "object",
            name: "hero",
            label: "Hero",
            fields: [
              {
                type: "object",
                name: "stats",
                label: "Hero stats",
                list: true,
                ui: { itemProps: (i) => ({ label: i?.value ? `${i.value} — ${i.label || ""}` : "Stat" }) },
                fields: [
                  { type: "string", name: "value", label: "Value", required: true },
                  { type: "string", name: "label", label: "Label", required: true }
                ]
              }
            ]
          },
          { type: "string", name: "outcomes", label: "Learning outcomes", list: true },
          {
            type: "object",
            name: "modules",
            label: "Modules",
            list: true,
            ui: { itemProps: (i) => ({ label: i?.title || "Module" }) },
            fields: [
              { type: "string", name: "title", label: "Title", required: true },
              { type: "string", name: "duration", label: "Duration" }
            ]
          },
          { type: "string", name: "accreditations", label: "Accreditations / approvals", list: true },
          {
            type: "object",
            name: "certificate",
            label: "Certificate",
            fields: [
              { type: "string", name: "delivery", label: "Delivery" },
              { type: "string", name: "validity", label: "Validity" },
              { type: "string", name: "accepted", label: "Accepted by" }
            ]
          },
          { type: "number", name: "priceFrom", label: "Price from (USD)" },
          { type: "string", name: "priceNote", label: "Price note (replaces or supplements priceFrom)" },
          {
            type: "object",
            name: "faqs",
            label: "Course FAQs",
            list: true,
            ui: { itemProps: (i) => ({ label: i?.q || "Question" }) },
            fields: [
              { type: "string", name: "q", label: "Question", required: true },
              { type: "string", name: "a", label: "Answer", ui: { component: "textarea" }, required: true }
            ]
          },
          { type: "string", name: "enrollId", label: "LMS enroll ID" }
        ]
      },

      // ── Blog Posts ─────────────────────────────────────────────────────
      {
        name: "blogPost",
        label: "Blog Posts",
        path: "content/blog",
        format: "md",
        ui: {
          itemProps: (item) => ({ label: item?.title || "Untitled post" }),
          filename: { readonly: true }
        },
        fields: [
          { type: "string", name: "title", label: "Title", required: true, isTitle: true },
          { type: "string", name: "excerpt", label: "Excerpt", ui: { component: "textarea" } },
          {
            type: "string",
            name: "category",
            label: "Category",
            options: ["Compliance", "Food safety", "Operations", "Alcohol", "Company", "Industry News", "Training Tips"]
          },
          {
            type: "object",
            name: "author",
            label: "Author",
            fields: [
              { type: "string", name: "name", label: "Name", required: true },
              { type: "string", name: "role", label: "Role" }
            ]
          },
          { type: "datetime", name: "publishedAt", label: "Published at", required: true },
          { type: "number", name: "readMinutes", label: "Read time (minutes)" },
          {
            type: "string",
            name: "heroTone",
            label: "Hero tone",
            options: ["accent", "warn", "positive", "critical", "purple"]
          },
          { type: "string", name: "heroIcon", label: "Hero icon (Font Awesome class)" },
          { type: "rich-text", name: "body", label: "Body", isBody: true }
        ]
      },

      // ── Legal Pages ────────────────────────────────────────────────────
      {
        name: "legalPage",
        label: "Legal Pages",
        path: "content/legal",
        format: "md",
        ui: {
          itemProps: (item) => ({ label: item?.title || "Untitled page" }),
          filename: { readonly: true }
        },
        fields: [
          { type: "string", name: "title", label: "Title", required: true, isTitle: true },
          { type: "datetime", name: "effectiveDate", label: "Effective date" },
          { type: "string", name: "intro", label: "Intro", ui: { component: "textarea" } },
          { type: "rich-text", name: "body", label: "Body", isBody: true }
        ]
      },

      // ── FAQ Groups (one file per category) ─────────────────────────────
      {
        name: "faqGroup",
        label: "FAQ Groups",
        path: "content/faqs",
        format: "json",
        ui: {
          itemProps: (item) => ({ label: item?.category || "Untitled group" })
        },
        fields: [
          { type: "string", name: "category", label: "Category", required: true, isTitle: true },
          { type: "number", name: "order", label: "Sort order" },
          {
            type: "object",
            name: "items",
            label: "Questions",
            list: true,
            ui: { itemProps: (i) => ({ label: i?.q || "Question" }) },
            fields: [
              { type: "string", name: "q", label: "Question", required: true },
              { type: "string", name: "a", label: "Answer", ui: { component: "textarea" }, required: true }
            ]
          }
        ]
      },

      // ── Testimonials ───────────────────────────────────────────────────
      {
        name: "testimonial",
        label: "Testimonials",
        path: "content/testimonials",
        format: "json",
        ui: {
          itemProps: (item) => ({ label: item?.name ? `${item.name} — ${item.company || ""}` : "Untitled" })
        },
        fields: [
          { type: "string", name: "id", label: "ID (slug)", required: true },
          { type: "string", name: "quote", label: "Quote", ui: { component: "textarea" }, required: true },
          { type: "string", name: "name", label: "Name", required: true, isTitle: true },
          { type: "string", name: "role", label: "Role" },
          { type: "string", name: "company", label: "Company" },
          {
            type: "object",
            name: "stat",
            label: "Impact stat (optional)",
            fields: [
              { type: "string", name: "value", label: "Value" },
              { type: "string", name: "label", label: "Label" }
            ]
          },
          { type: "boolean", name: "featured", label: "Featured?" },
          { type: "number", name: "order", label: "Sort order" }
        ]
      },

      // ── Team Members ───────────────────────────────────────────────────
      {
        name: "teamMember",
        label: "Team Members",
        path: "content/team",
        format: "json",
        ui: {
          itemProps: (item) => ({ label: item?.name || "Untitled" })
        },
        fields: [
          { type: "string", name: "name", label: "Name", required: true, isTitle: true },
          { type: "string", name: "role", label: "Role" },
          { type: "string", name: "bio", label: "Bio", ui: { component: "textarea" } },
          { type: "string", name: "linkedin", label: "LinkedIn URL" },
          { type: "string", name: "twitter", label: "Twitter URL" },
          { type: "number", name: "order", label: "Sort order" }
        ]
      }
    ]
  }
});
