import { createXai } from "@ai-sdk/xai";
import { experimental_generateVideo as generateVideo } from "ai";
import fs from "fs";
import 'dotenv/config';

const xai = createXai({
    apiKey: process.env.XAI_API_KEY!,
});

const { video } = await generateVideo({
    model: xai.video("grok-imagine-video"),
    prompt: {
        image: fs.readFileSync("grok_1778512462542.png"),
        text: "The woman presents her clipboard, talking excitedly and happily to the camera"
    },
    providerOptions: {
        xai: { duration: 4, aspectRatio: "16:9", resolution: "720p" },
    },
});

// The AI SDK downloads the video automatically — save the raw bytes
fs.writeFileSync(`output_${Date.now()}.mp4`, video.uint8Array);
