import { OpenRouter } from '@openrouter/sdk';
import * as fs from 'fs';
import * as path from 'path';

// Load your API Key from .env
const openRouter = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY || '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',
});

// The Benchmarking Prompt (optimized for modern 2026 line-art and sweat)
const benchmarkPrompt = `
Full-body anime-style illustration of an athletic female volleyball player. She has short, messy blonde hair and vibrant yellow-green eyes, sporting a confident smirk. She is wearing a blue and white volleyball jersey. She wears matching tight blue high-cut compression shorts. Her athletic body and legs are visibly glistening with light, realistic sweat, reflecting bright light. She holds a professional volleyball. Modern anime style, clean and sharp line-art, bold colors, cinematic sun-drenched lighting, masterfully detailed sweat textures. High-resolution, masterpiece.
`;

// Define the Curated 2026 Model List with their estimated costs
// OpenRouter updates these costs daily; these are 2026 averages.
const modelsToTest = [
    { id: 'google/gemini-3.1-flash-image-preview', cost: 0.000002, name: 'Google_NanoBanana2' },
    { id: 'google/gemini-3-pro-image-preview', cost: 0.000005, name: 'Google_NanoBananaPro' },
    { id: 'black-forest-labs/flux.2-max', cost: 0.06, name: 'BFL_Flux2Max_Grok3' },
    { id: 'black-forest-labs/flux.2-pro', cost: 0.05, name: 'BFL_Flux2Pro' },
    { id: 'bytedance-seed/seedream-4.5', cost: 0.03, name: 'Bytedance_Seedream4.5' },
    { id: 'sourceful/riverflow-v2-max-preview', cost: 0.04, name: 'Sourceful_RiverflowV2Max' },
    { id: 'openai/gpt-5-image', cost: 0.08, name: 'OpenAI_GPT5Image' },
];

const IMAGES_PER_MODEL = 3;
const imagesDir = path.join(process.cwd(), 'benchmark_output');

// Helper to sanitize filenames (handles / and :)
function getSafeFilename(text: string) {
    return text.replace(/[:\/]/g, '-');
}

async function runBenchmark() {
    // 1. Ensure the output directory exists
    if (!fs.existsSync(imagesDir)) {
        fs.mkdirSync(imagesDir);
        console.log(`📁 Created output directory: ${imagesDir}`);
    }

    console.log(`🚀 Starting Benchmark with ${modelsToTest.length} models, generating ${IMAGES_PER_MODEL} images each...\n`);

    for (const model of modelsToTest) {
        console.log(`====================================`);
        console.log(`🔄 Benchmarking: ${model.name} (${model.id})`);
        console.log(`💰 Estimated Cost/Image: $${model.cost.toFixed(6)}`);
        console.log(`====================================`);

        for (let i = 0; i < IMAGES_PER_MODEL; i++) {
            try {
                process.stdout.write(`  - Generating variation ${i + 1}/${IMAGES_PER_MODEL}... `);

                const result = await openRouter.chat.send({
                    chatGenerationParams: {
                        model: model.id,
                        messages: [{
                            role: 'user',
                            content: benchmarkPrompt,
                        }],
                        stream: false,
                        modalities: ['image'],
                        imageConfig: {
                            aspect_ratio: '9:16', // Keep the vertical anime style
                            image_size: '1K',
                        },
                    },
                });

                if (result.choices && result.choices[0] && result.choices[0].message && result.choices[0].message.images && result.choices[0].message.images[0]) {
                    const imageData = result.choices[0].message.images[0].imageUrl.url;
                    const base64Data = imageData.split(',')[1];
                    const buffer = Buffer.from(base64Data!, 'base64');

                    // Create the rich filename
                    const safeId = getSafeFilename(model.id);
                    const timestamp = Date.now();
                    const costString = model.cost.toFixed(6).replace('.', '_'); // Use _ for . in Windows paths
                    const filename = `${safeId}_var${i + 1}_cost_${costString}_${timestamp}.png`;
                    const fullPath = path.join(imagesDir, filename);

                    fs.writeFileSync(fullPath, buffer);
                    process.stdout.write(`✅ Saved to ${filename}\n`);
                } else {
                    process.stdout.write(`❌ No image returned. Response: ${result.choices[0]?.message.content}\n`);
                }

            } catch (error: any) {
                console.log(`\n❌ Error with model ${model.id}:`);
                console.error(error.response?.data || error.message);
                // Continue to the next variation/model even if one fails
            }
        }
        console.log(`\n`);
    }

    console.log(`🏁 Benchmark complete. View outputs in the 'benchmark_output' folder.`);
}

runBenchmark();