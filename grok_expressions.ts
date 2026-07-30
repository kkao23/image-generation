import fs from "fs";
import path from "path";
import 'dotenv/config';

const imageBuffer = fs.readFileSync("image-a1762f12.png");
const base64Image = imageBuffer.toString("base64");

const expressions = [
  { label: "happy",     prompt: "The person in the image with a big happy smile, joyful expression" },
  { label: "excited",   prompt: "The person in the image looking excited and enthusiastic, wide eyes, big grin" },
  { label: "disgusted", prompt: "The person in the image with a disgusted expression, nose wrinkled, mouth turned down" },
  { label: "angry",     prompt: "The person in the image looking angry, furrowed brows, intense stare" },
  { label: "sad",       prompt: "The person in the image looking sad and dejected, downcast eyes, slight frown" },
  { label: "surprised", prompt: "The person in the image with a surprised expression, raised eyebrows, mouth open" },
  { label: "fearful",   prompt: "The person in the image looking scared and fearful, wide eyes, tense expression" },
  { label: "neutral",   prompt: "The person in the image with a calm, neutral, relaxed expression" },
];

const outputDir = "expressions_output";
fs.mkdirSync(outputDir, { recursive: true });

for (const expression of expressions) {
  console.log(`⏳ Generating: ${expression.label}...`);

  const response = await fetch("https://api.x.ai/v1/images/edits", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.XAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "grok-imagine-image",
      prompt: expression.prompt,
      image: {
        type: "image_url",
        url: `data:image/png;base64,${base64Image}`,
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(`❌ API error for "${expression.label}":`, data);
    continue; // skip this one, keep going
  }

  const imageUrl = data.data[0].url;
  const imgResponse = await fetch(imageUrl);
  const buffer = Buffer.from(await imgResponse.arrayBuffer());

  const filename = path.join(outputDir, `${expression.label}.png`);
  fs.writeFileSync(filename, buffer);
  console.log(`✅ Saved: ${filename}`);
}

console.log(`\n🎉 Done! All images saved to ./${outputDir}/`);