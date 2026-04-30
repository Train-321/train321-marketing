// Sanity Presentation calls this URL with `?sanity-preview-secret=...` and
// `?sanity-preview-pathname=...`. We validate the secret against Sanity, flip
// Next.js draft mode on, and bounce the request to the requested pathname.

import { validatePreviewUrl } from "@sanity/preview-url-secret";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { sanityClient } from "@/lib/sanity";

const token = process.env.SANITY_API_READ_TOKEN || process.env.SANITY_WRITE_TOKEN;

export async function GET(req: Request) {
  if (!token) {
    return new Response("Sanity preview token missing", { status: 500 });
  }

  const clientWithToken = sanityClient.withConfig({ token });
  const { isValid, redirectTo = "/" } = await validatePreviewUrl(
    clientWithToken,
    req.url
  );

  if (!isValid) {
    return new Response("Invalid preview secret", { status: 401 });
  }

  (await draftMode()).enable();
  redirect(redirectTo);
}
