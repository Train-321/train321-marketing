import { tinaFaqGroupConnection } from "@/lib/tina";
import FaqClient from "./FaqClient";

export const metadata = {
  title: "FAQ — Train321",
  description: "Answers to the questions we hear most often."
};

export default async function FaqPage() {
  const result = await tinaFaqGroupConnection();
  return <FaqClient {...result} />;
}
