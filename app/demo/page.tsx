import { getDemoPage } from "@/lib/sanity";
import DemoClient from "./DemoClient";

export const metadata = {
  title: "Book a Platform Demo",
  description:
    "See how teams assign courses, track completions and pull certificates from one dashboard. A 20-minute walkthrough with a real person, no commitment.",
  alternates: { canonical: "/demo" }
};

export default async function DemoPage() {
  const page = await getDemoPage();
  return <DemoClient page={page} />;
}
