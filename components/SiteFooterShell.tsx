// Server wrapper for SiteFooter. Fetches site settings and hands them to
// the client component, so copy is click-to-edit in Presentation. The menu
// links aren't, so they still navigate (see STEGA_SKIP_MENUS in lib/sanity.ts).

import { getSiteSettings } from "@/lib/sanity";
import SiteFooter from "./SiteFooter";

export default async function SiteFooterShell() {
  const settings = await getSiteSettings();
  return <SiteFooter settings={settings} />;
}
