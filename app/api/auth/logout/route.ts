import { NextResponse } from "next/server";
import { TOKEN_COOKIE, USER_COOKIE } from "@/lib/auth";

// Drop both cookies. The API token stays valid on the backend until it
// expires — this only ends the session on this device.
export async function POST() {
  const res = NextResponse.json({ ok: true });
  for (const name of [TOKEN_COOKIE, USER_COOKIE]) {
    res.cookies.set(name, "", { path: "/", maxAge: 0 });
  }
  return res;
}
