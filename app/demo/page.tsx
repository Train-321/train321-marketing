import { getDemoPage } from "@/lib/sanity";
import DemoClient from "./DemoClient";

export const metadata = {
  title: "Book a demo",
  description: "20-minute walkthrough of the Train 321 platform with a real human.",
  alternates: { canonical: "/demo" }
};

export default async function DemoPage() {
  const page = await getDemoPage();
  return <DemoClient page={page} />;
}
