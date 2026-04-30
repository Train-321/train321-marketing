import { notFound } from "next/navigation";
import { tinaLegalPage, tinaLegalPageConnection } from "@/lib/tina";
import LegalPageClient from "./LegalPageClient";

export async function generateStaticParams() {
  const result = await tinaLegalPageConnection();
  return (
    result.data.legalPageConnection.edges
      ?.map((edge) => edge?.node?._sys?.filename)
      .filter((s): s is string => Boolean(s))
      .map((slug) => ({ slug })) ?? []
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await tinaLegalPage(slug);
  if (!result) return { title: "Legal — Train321" };
  const page = result.data.legalPage;
  return {
    title: `${page.title} — Train321`,
    description: page.intro || ""
  };
}

export default async function LegalPageRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await tinaLegalPage(slug);
  if (!result) return notFound();
  return <LegalPageClient {...result} />;
}
