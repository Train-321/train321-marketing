import HomePage from "@/components/HomePage";

export const metadata = {
  title: "Train321 — Compliance training your team actually finishes",
  description:
    "ANSI-accredited courses for food safety, alcohol service, and HR compliance. Rolled out across your team in under an hour. Accepted in all 50 states."
};

export default function Page() {
  return <HomePage forcedAudience={null} />;
}
