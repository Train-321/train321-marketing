import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, breadcrumbLd } from "@/lib/seo";
import { getCourses, type Course } from "@/lib/sanity";
import { STATIC_COURSES } from "@/lib/staticCourses";
import { CATCH_ALL_SLUGS, courseRank } from "@/lib/courseOrder";
import "./courses.css";

// The hub every course page hangs off. /catalog is the shop (LMS-driven,
// filterable, client-rendered); this is the plain, crawlable index — one
// link to every course page, grouped the way people look for them. Course
// breadcrumbs point here, and it's the page /courses always should have been
// (the URL used to 404).

export const revalidate = 3600;

export const metadata = {
  title: "Online Compliance Courses: Food Handler, Alcohol & Harassment Training",
  description:
    "Every Train 321 course in one place: food handler and food manager certification, alcohol server training (TABC, California RBS), harassment prevention and more.",
  alternates: { canonical: "/courses" }
};

const GROUPS: Array<{ key: NonNullable<Course["category"]> | "other"; heading: string; lede: string }> = [
  {
    key: "food",
    heading: "Food safety",
    lede: "Food handler cards and food manager certification for kitchen and counter staff."
  },
  {
    key: "alcohol",
    heading: "Alcohol service",
    lede: "Seller-server training for bartenders, servers and store staff, including state programs."
  },
  {
    key: "hr",
    heading: "HR and workplace compliance",
    lede: "Harassment prevention, human trafficking awareness and the training states require of employers."
  },
  {
    key: "other",
    heading: "Skills and operations",
    lede: "Service, safety and role-specific training for restaurant and hospitality teams."
  }
];

export default async function CoursesHubPage() {
  const sanity = await getCourses();
  // Code-defined courses (TABC) that have no Sanity document still get listed.
  const courses: Course[] = [
    ...sanity,
    ...Object.values(STATIC_COURSES).filter((s) => !sanity.some((c) => c.slug === s.slug))
  ];

  const groupOf = (c: Course) =>
    CATCH_ALL_SLUGS.has(c.slug) || !c.category || !["food", "alcohol", "hr"].includes(c.category)
      ? "other"
      : c.category;
  // Lead each group with the courses people come looking for; the rest keep
  // Sanity's alphabetical order behind them.
  const grouped = GROUPS.map((g) => ({
    ...g,
    courses: courses.filter((c) => groupOf(c) === g.key).sort((a, b) => courseRank(a.slug) - courseRank(b.slug))
  })).filter((g) => g.courses.length > 0);

  const listLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Train 321 courses",
    itemListElement: courses.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.title,
      url: `${SITE_URL}/courses/${c.slug}`
    }))
  };

  return (
    <div className="t321-mkt-courses">
      <JsonLd data={listLd} />
      <JsonLd
        data={breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Courses", path: "/courses" }
        ])}
      />
      <section className="t321-mkt-courses__hero">
        <div className="t321-mkt-container">
          <nav className="t321-mkt-courses__crumbs" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <i className="fas fa-angle-right" aria-hidden="true" />
            <span>Courses</span>
          </nav>
          <h1 className="t321-mkt-h1">Online compliance courses</h1>
          <p className="t321-mkt-lede">
            Every Train 321 course, grouped by what it covers. Open a course to see what it
            includes and where it is accepted, or{" "}
            <Link href="/catalog">browse the catalog by state</Link> to buy.
          </p>
        </div>
      </section>

      {grouped.map((g, gi) => (
        <section
          key={g.key}
          className={`t321-mkt-section${gi % 2 === 1 ? " t321-mkt-section--sunk" : ""}`}
        >
          <div className="t321-mkt-container">
            <h2 className="t321-mkt-h2">{g.heading}</h2>
            <p className="t321-mkt-lede">{g.lede}</p>
            <ul className="t321-mkt-courses__grid">
              {g.courses.map((c) => (
                <li key={c.slug}>
                  <Link href={`/courses/${c.slug}`} className="t321-mkt-card t321-mkt-card--hover">
                    <span className="t321-mkt-courses__icon" aria-hidden="true">
                      <i className={c.icon || "fas fa-book"} />
                    </span>
                    <h3 className="t321-mkt-h3">{c.title}</h3>
                    {c.tagline && <p>{c.tagline}</p>}
                    {typeof c.priceFrom === "number" && c.priceFrom > 0 && (
                      <span className="t321-mkt-courses__price">From ${c.priceFrom}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      <section className="t321-mkt-section t321-mkt-section--ink">
        <div className="t321-mkt-container t321-mkt-courses__cta">
          <div>
            <h2 className="t321-mkt-h2">Training a whole team?</h2>
            <p className="t321-mkt-lede">
              Buy seats, invite learners and track completion from one dashboard.
            </p>
          </div>
          <div className="t321-mkt-courses__cta-actions">
            <Link href="/catalog" className="t321-mkt-btn t321-mkt-btn--accent t321-mkt-btn--lg">
              Browse the catalog
            </Link>
            <Link href="/demo" className="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg">
              See a demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
