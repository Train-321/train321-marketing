// Server wrapper for SiteFooter. Fetches site settings and hands them to
// the client component, so copy and links are click-to-edit in Presentation.

import { getSiteSettings } from "@/lib/sanity";
import SiteFooter from "./SiteFooter";

export default async function SiteFooterShell() {
  const settings = await getSiteSettings();
  return <SiteFooter settings={settings} />;
}
