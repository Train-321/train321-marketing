import { tinaCourseConnection } from "@/lib/tina";
import CatalogClient from "./CatalogClient";

export const metadata = {
  title: "Catalog — Train321",
  description: "Every course Train321 offers, on a single page."
};

export default async function CatalogPage() {
  const result = await tinaCourseConnection();
  return <CatalogClient {...result} />;
}
