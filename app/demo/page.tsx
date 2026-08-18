import { getDemoPage } from "@/lib/sanity";
import DemoClient from "./DemoClient";

export const metadata = {
  title: "Book a demo — Train 321",
  description: "20-minute walkthrough of the Train 321 platform with a real human."
};

export default async function DemoPage() {
  const page = await getDemoPage();
  return <DemoClient page={page} />;
}
