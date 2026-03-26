import { createXai } from "@ai-sdk/xai";
import { generateImage } from "ai";
import fs from 'fs';

const xai = createXai({
    apiKey: process.env.XAI_API_KEY!,
});

const { image } = await generateImage({
    model: xai.image("grok-imagine-image"),
    prompt: "",
});

//console.log(image.base64);
const base64Data = image.base64;
const buffer = Buffer.from(base64Data!, 'base64');

const timestamp = Date.now();
const filename = `grok_${timestamp}.png`;
const fullPath = `./${filename}`;


fs.writeFileSync(fullPath, buffer);
process.stdout.write(`✅ Saved to ${filename}\n`);
