import 'dotenv/config';
import fs from 'fs';

const headers = {
  Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
  'Content-Type': 'application/json',
};

// Step 1: Submit the generation request
const response = await fetch('https://openrouter.ai/api/v1/videos', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    model: 'google/veo-3.1-lite',
    resolution: '720p',
    frame_images: [
    {
      type: "image_url",
      image_url: {
        url: "https://temp-image.com/ib/NChrHZkKIjUDF7X_1777227098.png"
      },
      frame_type: "first_frame"
    },
  ],
    prompt: 'The woman shrugs and gives a shy smile',
    duration: 8,
    generate_audio: false
  }),
});

const result = await response.json();
// Add this block right after parsing the response
if (!response.ok || result.error) {
  console.error('API error:', JSON.stringify(result, null, 2));
  process.exit(1);
}
const jobId = result.id;
const pollingUrl = result.polling_url;
console.log(`Job submitted: ${jobId}`);
console.log(`Status: ${result.status}`);

// Step 2: Poll until completion
while (true) {
  await new Promise((resolve) => setTimeout(resolve, 30000)); // Wait 30 seconds
  const pollResponse = await fetch(pollingUrl, { headers });
  const status = await pollResponse.json();

  console.log(`Status: ${status.status}`);

  if (status.status === 'completed') {
    // Step 3: Download the video
    const contentUrl = status.unsigned_urls[0];
    const videoResponse = await fetch(contentUrl);
    const videoBuffer = await videoResponse.arrayBuffer();
    // Save or process the video buffer
    console.log(`Video ready: ${contentUrl}`);
    fs.writeFileSync(`output_${Date.now()}.mp4`, Buffer.from(videoBuffer));
    break;
  } else if (status.status === 'failed') {
    console.error(`Generation failed: ${status.error ?? 'Unknown error'}`);
    break;
  }
}
