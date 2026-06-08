// One-off: generate the individuals hero figure via OpenAI gpt-image-1.
// Run with OPENAI_API_KEY in env. Writes a transparent PNG to public/img.
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const key = process.env.OPENAI_API_KEY;
if (!key) {
  console.error("Missing OPENAI_API_KEY");
  process.exit(1);
}

const prompt = `A cheerful young American woman sitting cross-legged with an open laptop resting on her lap, facing forward toward the camera and making direct eye contact with the viewer, with a warm, friendly, confident smile, hands on the laptop keyboard. Modern casual smart clothing in neutral tones. Clean, bright, photorealistic studio lighting, soft shadows. The woman and the laptop only, isolated on a fully transparent background, no floor visible beneath her, no wall, no desk, no props, no text. Full seated figure centered with a little headroom, knees and feet included so the figure reaches toward the bottom, high detail, crisp edges suitable for compositing over a colored web hero background.`;

const body = {
  model: "gpt-image-1",
  prompt,
  size: "1024x1536",
  quality: "high",
  background: "transparent",
  n: 1,
};

const res = await fetch("https://api.openai.com/v1/images/generations", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  },
  body: JSON.stringify(body),
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
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, Buffer.from(b64, "base64"));
console.log("Wrote", out);
