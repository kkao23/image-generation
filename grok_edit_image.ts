import { xai } from "@ai-sdk/xai";
import { generateImage } from "ai";
import fs from "fs";

// Load image and encode as base64
const imageBuffer = fs.readFileSync("photo.png");
const base64Image = imageBuffer.toString("base64");

const { image } = await generateImage({
    model: xai.image("grok-imagine-image"),
    prompt: "Render this as a pencil sketch with detailed shading",
    providerOptions: {
        xai: {
            image: `data:image/png;base64,${base64Image}`,
        },
    },
});

console.log(image.base64);
