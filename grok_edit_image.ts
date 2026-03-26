import { createXai } from "@ai-sdk/xai";
import { generateImage } from "ai";
import fs from "fs";
import 'dotenv/config';

const xai = createXai({
    apiKey: process.env.XAI_API_KEY!,
});

// Load image and encode as base64
const imageBuffer = fs.readFileSync("grok_1774488871062.png");
const base64Image = imageBuffer.toString("base64");

const { image } = await generateImage({
    model: xai.image("grok-imagine-image"),
    prompt: "this doesnt work",
    providerOptions: {
        xai: {
            image: `data:image/png;base64,${base64Image}`,
        },
    },
});

//console.log(image.base64);

const base64Data = image.base64;
const buffer = Buffer.from(base64Data!, 'base64');

const timestamp = Date.now();
const filename = `grok_${timestamp}.png`;
const fullPath = `./${filename}`;


fs.writeFileSync(fullPath, buffer);
process.stdout.write(`✅ Saved to ${filename}\n`);
