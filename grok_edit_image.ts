import fs from "fs";
import 'dotenv/config';

const imageBuffer = fs.readFileSync("image-23b87613.png");
const base64Image = imageBuffer.toString("base64");

const response = await fetch("https://api.x.ai/v1/images/edits", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.XAI_API_KEY}`,
    },
    body: JSON.stringify({
        model: "grok-imagine-image-quality",
        // prompt: "High-detail digital anime illustration, realistic proportions, female character, soft skin rendering with subsurface scattering. Retain clothing, retain background. small bust, A cup breasts. volumetric fog, sharp focus, 8k resolution, hyper-detailed rendering. Have the woman face the camera",
        prompt: "change the girl's haircut to a medium length bob. She should not have bangs",
        image: {
            type: "image_url",
            url: `data:image/png;base64,${base64Image}`,
        },
        // aspect_ratio is ignored for single-image edits (follows source image)
    }),
});

const data = await response.json();

if (!response.ok) {
    console.error("API error:", data);
    process.exit(1);
}

// Response contains a URL by default — download it
const imageUrl = data.data[0].url;
const imgResponse = await fetch(imageUrl);
const buffer = Buffer.from(await imgResponse.arrayBuffer());

const filename = `grok_${Date.now()}.png`;
fs.writeFileSync(filename, buffer);
console.log(`✅ Saved to ${filename}`);