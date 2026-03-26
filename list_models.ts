import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.OPENROUTER_API_KEY;

async function listImageModels() {
  try {
    const response = await axios.get('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const allModels = response.data.data;

    // Filter for models that explicitly support image generation
    const imageModels = allModels.filter((model: any) => {
      const modalities = model.architecture?.output_modalities || [];
      return modalities.includes('image') || model.id.includes('image') || model.id.includes('cogview') || model.id.includes('flux');
    });

    console.log(`--- Found ${imageModels.length} Image-Capable Models ---\n`);
    
    imageModels.forEach((model: any) => {
      console.log(`ID:   ${model.id}`);
      console.log(`Name: ${model.name}`);
      console.log(`Cost: $${model.pricing.image || 'Variable'}/image`);
      console.log(`-----------------------------------`);
    });

  } catch (error) {
    console.error('Error fetching models:', error);
  }
}

listImageModels();