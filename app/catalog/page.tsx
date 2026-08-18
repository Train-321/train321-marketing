import { getCatalogPage } from "@/lib/sanity";
import { getMarketplaceCatalog } from "@/lib/newFeatures";
import CatalogClient from "./CatalogClient";

export const metadata = {
  title: "Catalog — Train 321",
  description: "Every course Train 321 offers, on a single page."
};

// Catalog data (courses, categories, search corpus) comes from the new-features
// LMS backend marketplace — not Sanity. The Sanity catalog page doc still
// supplies the editorial hero copy + bottom CTA.
export default async function CatalogPage() {
  const [{ courses, categories, total }, page] = await Promise.all([
    getMarketplaceCatalog(),
    getCatalogPage()
  ]);

  return (
    <CatalogClient
      initialCourses={courses}
      categories={categories}
      initialTotal={total}
      page={page}
    />
  );
}
