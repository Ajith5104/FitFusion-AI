import { Client, handle_file } from '@gradio/client';
import Replicate from 'replicate';

/**
 * Trigger IDM-VTON virtual try-on via multiple providers
 * Priority: 1. Replicate (Paid/Stable) > 2. HF Authenticated (Free/Quota) > 3. HF Guest (Limited)
 */
export const runVirtualTryOn = async (garmentImageUrl, personImageUrl, options = {}) => {
  const { 
    description = 'A stylish outfit', 
    customHfToken, 
    customReplicateToken 
  } = options;

  const parseTokens = (source) => source?.split(',').map(t => t.trim()).filter(Boolean) || [];
  
  const hfPool = [...parseTokens(customHfToken), ...parseTokens(process.env.HF_TOKEN)];
  const replicatePool = [...parseTokens(customReplicateToken), ...parseTokens(process.env.REPLICATE_API_TOKEN)];

  // Pick a random Replicate token (we only need one per request since it's paid)
  const replicateToken = replicatePool[Math.floor(Math.random() * replicatePool.length)];

  // Initialize HF token rotation index
  let currentTokenIndex = Math.floor(Math.random() * Math.max(1, hfPool.length));

  // --- Provider 1: Replicate (Premium Path) ---
  if (replicateToken) {
    console.log(`Provider: Attempting Replicate (${customReplicateToken ? 'Custom' : 'System'})...`);
    try {
      const replicate = new Replicate({ auth: replicateToken });
      const output = await replicate.run(
        "cuuupid/idm-vton:c871bb9b0ad9001a686a27ce3ff0aa84d09395f190bc1f302507851d4596b446",
        {
          input: {
            crop: true,
            seed: 42,
            steps: 30,
            category: "upper_body",
            garm_img: garmentImageUrl,
            human_img: personImageUrl,
            garment_des: description
          }
        }
      );
      console.log('Success: Replicate processed try-on.');
      return Array.isArray(output) ? output[0] : output;
    } catch (error) {
      console.error('Replicate Error:', error.message);
      // Fall through to HuggingFace
    }
  }

  // --- Provider 2: HuggingFace (Free Paths with Mirroring) ---
  // Ordered by reliability: official/popular spaces first
  const mirrors = [
    'yisol/IDM-VTON',
    'Nymbo/IDM-VTON',
    'vikhyatk/IDM-VTON',
    'Ailyth/IDM-VTON',
    'Kadirnar/IDM-VTON',
    'Kushagra7/IDM-VTON',
    'M-A-D/IDM-VTON',
    'Zhenfeng-He/IDM-VTON',
    'gokaygokay/IDM-VTON',
    'Wild-Lion/IDM-VTON',
    'ff-vton/IDM-VTON',
    'levihsu/OOTDiffusion'
  ];

  console.log(`Provider: Using HF Token Source: ${customHfToken ? 'CUSTOM' : (process.env.HF_TOKEN ? 'SYSTEM' : 'NONE')} (Pool Size: ${hfPool.length})`);

  // Try ALL mirrors — don't give up after just 3
  const maxAttempts = mirrors.length;
  let attempts = 0;

  for (const mirror of mirrors) {
    attempts++;
    console.log(`Provider: Attempting HuggingFace Mirror [${attempts}/${maxAttempts}] (${mirror})...`);
    try {
      // Rotate active token dynamically
      const activeHfToken = hfPool.length > 0 ? hfPool[currentTokenIndex % hfPool.length] : undefined;

      // Race connection against a timeout so offline spaces fail fast
      const connectWithTimeout = (ms) => Promise.race([
        Client.connect(mirror, {
          hf_token: activeHfToken,
          token: activeHfToken,
        }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timed out')), ms))
      ]);

      const client = await connectWithTimeout(15000);

      console.log(`Connected to mirror: ${mirror}. Starting prediction...`);

      let result;
      
      // Different models have different API paths and parameters
      if (mirror.includes('OOTDiffusion')) {
        // OOTDiffusion simplified call (common in mirrors)
        result = await client.predict('/process_hd', [
          handle_file(personImageUrl),
          handle_file(garmentImageUrl),
          'Upper body' // category
        ]);
      } else {
        // Standard IDM-VTON call
        // If /tryon fails with IndexError, we might need a different structure
        try {
          result = await client.predict('/tryon', {
            dict: {
              background: handle_file(personImageUrl),
              layers: [],
              composite: null,
            },
            garm_img: handle_file(garmentImageUrl),
            garment_des: description || 'A stylish outfit',
            is_checked: true,
            is_checked_crop: false,
            denoise_steps: 30,
            seed: 42,
          });
        } catch (innerError) {
          if (innerError.message.includes('IndexError')) {
            console.log(`Retrying ${mirror} with alternative parameter structure...`);
            // Attempt with composite set to background to avoid IndexError on some versions
            result = await client.predict('/tryon', {
              dict: {
                background: handle_file(personImageUrl),
                layers: [],
                composite: handle_file(personImageUrl),
              },
              garm_img: handle_file(garmentImageUrl),
              garment_des: description || 'A stylish outfit',
              is_checked: true,
              is_checked_crop: false,
              denoise_steps: 30,
              seed: 42,
            });
          } else {
            throw innerError;
          }
        }
      }

      console.log(`Success: HuggingFace Mirror (${mirror}) processed try-on.`);
      
      // Handle different result formats
      const output = result.data[0];
      if (typeof output === 'string') return output;
      if (typeof output === 'object' && output !== null) {
        return output.url || output.path;
      }
      
    } catch (error) {
      const errorMsg = error.message || 'Unknown error';
      console.warn(`Mirror (${mirror}) Failed:`, errorMsg);
      
      if (errorMsg.includes('ZeroGPU quotas') || errorMsg.includes('too many requests') || errorMsg.includes('limit reached')) {
        console.log(`Quota hit on ${mirror}.`);
        if (hfPool.length > 1) {
          currentTokenIndex++;
          console.log(`Rotating to next HF token in pool...`);
        }
        console.log(`Moving to next mirror...`);
        continue;
      }
      
      if (errorMsg.includes('Space metadata could not be loaded') || errorMsg.includes('Could not resolve app config') || errorMsg.includes('IndexError')) {
        console.log(`${mirror} seems offline, misconfigured, or input failed. Moving to next...`);
        continue;
      }

      if (errorMsg.includes('Unauthorized') || errorMsg.includes('401')) {
        console.warn(`HuggingFace Auth Failed for current token on ${mirror}. Rotating...`);
        if (hfPool.length > 1) {
          currentTokenIndex++;
        }
        continue;
      }
      
      console.log(`Moving to next mirror after error on ${mirror}`);
    }
  }

  // If all mirrors fail
  throw new Error(
    'AI Generation Failed: All providers are currently at quota or offline. ' +
    'Please try again in a few minutes or add a REPLICATE_API_TOKEN for dedicated access.'
  );
};
