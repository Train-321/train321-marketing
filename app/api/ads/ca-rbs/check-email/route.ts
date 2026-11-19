import { NextResponse } from "next/server";
import { adsPost } from "@/lib/adsRbs";

// California RBS ad page: does this email already have a Train 321 account?
// Decides whether the form asks for a new password or the existing one.
export async function POST(request: Request) {
  let email = "";
  try {
    email = String(((await request.json()) as { email?: string }).email || "").trim();
  } catch {
    /* fall through */
  }
  if (!email) return NextResponse.json({ message: "Email is required." }, { status: 422 });
  try {
    const { status, data } = await adsPost("check-email", { email });
    if (status >= 400) return NextResponse.json({ exists: false, unknown: true }, { status: 200 });
    return NextResponse.json({ exists: Boolean(data?.exists) });
  } catch {
    // Can't tell — the new-account checkout rejects a duplicate email itself.
    return NextResponse.json({ exists: false, unknown: true });
  }
}
