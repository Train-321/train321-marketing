import { NextResponse } from "next/server";

// Forwards a "Report an issue" submission to the Train321 API, which is the
// same endpoint the LMS login screen posts to — so a report raised from the
// marketing site lands in the same inbox, in the same shape, as one raised
// from inside the app. No second support pipeline to maintain or triage.
//
// Server-to-server like the other /api routes here: it keeps the API base out
// of the browser and sidesteps CORS entirely, and the endpoint is public
// (UserBugStoreRequest::authorize returns true), so no credentials are needed.

const API_BASE = process.env.API_BASE || "https://api.train321.com";

/** Mirrors UserBugStoreRequest on the backend. Anything else is dropped. */
const ALLOWED_FIELDS = ["name", "email", "issue_type", "comments", "platform"] as const;

/** Backend caps the upload at 8MB; reject here too rather than pay the upload. */
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const incoming = await request.formData();

    const issueType = String(incoming.get("issue_type") || "").trim();
    if (!issueType) {
      return NextResponse.json({ message: "Please select an issue type." }, { status: 422 });
    }

    // Rebuild rather than forward wholesale: only the fields the backend
    // validates get through, so a crafted extra field can't ride along.
    const outgoing = new FormData();
    for (const field of ALLOWED_FIELDS) {
      const value = incoming.get(field);
      if (typeof value === "string" && value.trim() !== "") {
        outgoing.append(field, value.trim());
      }
    }

    const image = incoming.get("image");
    if (image instanceof File && image.size > 0) {
      if (image.size > MAX_IMAGE_BYTES) {
        return NextResponse.json({ message: "The image must not exceed 8MB." }, { status: 422 });
      }
      outgoing.append("image", image, image.name);
    }

    // Marks where the report came from, so whoever triages it can tell a
    // marketing-site report from one raised inside the LMS.
    if (!outgoing.has("platform")) {
      outgoing.append("platform", "marketing");
    }

    let res: Response;
    try {
      res = await fetch(`${API_BASE}/api/user-bugs`, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: outgoing,
        cache: "no-store"
      });
    } catch {
      return NextResponse.json(
        { message: "We couldn't reach the reporting service. Please try again." },
        { status: 502 }
      );
    }

    const data = (await res.json().catch(() => null)) as
      | { message?: string; errors?: Record<string, string[]> }
      | null;

    if (!res.ok) {
      // Surface the backend's own validation wording where it has any — it is
      // more specific than anything invented here.
      const firstError = data?.errors ? Object.values(data.errors)[0]?.[0] : null;
      return NextResponse.json(
        { message: firstError || data?.message || "We couldn't submit your report." },
        { status: res.status || 500 }
      );
    }

    return NextResponse.json({
      message: data?.message || "Thanks — your report has been sent."
    });
  } catch {
    return NextResponse.json(
      { message: "Something went wrong submitting your report." },
      { status: 500 }
    );
  }
}
