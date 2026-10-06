import { getCatalogPage } from "@/lib/sanity";
import { getMarketplaceCatalog } from "@/lib/newFeatures";
import CatalogClient from "./CatalogClient";

export const metadata = {
  title: "Course Catalog & Pricing",
  description:
    "Every Train 321 course with prices up front: food handler and food manager certification, TABC and RBS alcohol server training, harassment prevention and more.",
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
