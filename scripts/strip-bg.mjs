// Second pass: take the generated figure and force a transparent background
// via the OpenAI image edits endpoint. Run with OPENAI_API_KEY in env.
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const key = process.env.OPENAI_API_KEY;
if (!key) {
  console.error("Missing OPENAI_API_KEY");
  process.exit(1);
}

const src = resolve(process.cwd(), "public/img/hero-individual-v2.png");
const buf = readFileSync(src);

const form = new FormData();
form.append("model", "gpt-image-1");
form.append(
  "image",
  new Blob([buf], { type: "image/png" }),
  "hero-individual-v2.png"
);
form.append(
  "prompt",
  "Keep the woman and her laptop exactly as they are, completely unchanged. Remove the entire background and make it fully transparent: no gradient, no vignette, no floor, no wall, no ground shadow — only the woman and the laptop on a transparent alpha background, with clean crisp edges."
);
form.append("size", "1024x1536");
form.append("background", "transparent");
form.append("quality", "high");

const res = await fetch("https://api.openai.com/v1/images/edits", {
  method: "POST",
  headers: { Authorization: `Bearer ${key}` },
  body: form,
});

if (!res.ok) {
  console.error("API error", res.status, await res.text());
  process.exit(1);
}

const json = await res.json();
const b64 = json?.data?.[0]?.b64_json;
if (!b64) {
  console.error("No image data:", JSON.stringify(json).slice(0, 500));
  process.exit(1);
}

const out = resolve(process.cwd(), "public/img/hero-individual-v2.png");
writeFileSync(out, Buffer.from(b64, "base64"));
console.log("Wrote", out);
