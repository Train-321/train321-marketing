import HomePage from "@/components/HomePage";

export const metadata = {
  title: "Get certified in under an hour — Train321",
  description:
    "ANSI-accredited courses for food safety, alcohol service, and HR compliance. Take it on your phone, get your certificate the same day. Accepted in all 50 states."
};

export default function IndividualsPage() {
  return <HomePage forcedAudience="self" />;
}
