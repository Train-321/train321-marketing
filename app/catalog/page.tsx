import { getCatalogPage } from "@/lib/sanity";
import { getMarketplaceCatalog } from "@/lib/newFeatures";
import CatalogClient from "./CatalogClient";

export const metadata = {
  title: "Catalog",
  description: "Every course Train 321 offers, on a single page.",
  alternates: { canonical: "/catalog" }
};

// Catalog data (courses, categories, search corpus) comes from the new-features
// LMS backend marketplace — not Sanity. The Sanity catalog page doc still
// supplies the editorial hero copy + bottom CTA.
export default async function CatalogPage() {
  const [{ courses, categories, groups, total }, page] = await Promise.all([
    getMarketplaceCatalog(),
    getCatalogPage()
  ]);

  return (
    <CatalogClient
      initialCourses={courses}
      categories={categories}
      groups={groups}
      initialTotal={total}
      page={page}
    />
  );
}
