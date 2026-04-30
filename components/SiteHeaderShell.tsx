// Server wrapper that fetches site settings and passes them into the
// client SiteHeader. Keeps the header's interactivity (drawer, scroll) on
// the client while sourcing copy + contact info from Sanity.

import { getSiteSettings } from "@/lib/sanity";
import SiteHeader from "./SiteHeader";

export default async function SiteHeaderShell() {
  const settings = await getSiteSettings();
  return <SiteHeader settings={settings} />;
}
