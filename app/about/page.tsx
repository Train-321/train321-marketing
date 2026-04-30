import { tinaTeamMemberConnection, tinaSiteSettings } from "@/lib/tina";
import AboutClient from "./AboutClient";

export const metadata = {
  title: "About — Train321",
  description: "The team and mission behind Train321."
};

export default async function AboutPage() {
  const [teamRes, settingsRes] = await Promise.all([
    tinaTeamMemberConnection(),
    tinaSiteSettings()
  ]);
  return <AboutClient teamRes={teamRes} settingsRes={settingsRes} />;
}
