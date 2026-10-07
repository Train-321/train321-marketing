import { NextResponse } from "next/server";

// Which US state the visitor is probably in, from Vercel's edge geo headers.
// Absent locally and on non-Vercel hosts, in which case the finder simply
// doesn't suggest a state. Never auto-applied — see HeroV5.

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  let country = req.headers.get("x-vercel-ip-country");
  let region = req.headers.get("x-vercel-ip-country-region");
  // Local testing only: /api/geo?region=TX stands in for the edge header.
  if (process.env.NODE_ENV !== "production") {
    const fake = new URL(req.url).searchParams.get("region");
    if (fake) {
      country = "US";
      region = fake.toUpperCase();
    }
  }
  const ok = country === "US" && region && /^[A-Z]{2}$/.test(region);
  return NextResponse.json(
    { region: ok ? region : null },
    { headers: { "Cache-Control": "private, no-store" } }
  );
}
