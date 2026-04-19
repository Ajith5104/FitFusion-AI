import Replicate from 'replicate';
import dotenv from 'dotenv';
import cloudinary from 'cloudinary';

dotenv.config();

// Test Replicate connection by checking the token is set
const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

async function testReplicate() {
  console.log('\n=== REPLICATE TOKEN TEST ===');
  const token = process.env.REPLICATE_API_TOKEN;
  console.log('Token present:', !!token);
  console.log('Token starts with r8_:', token?.startsWith('r8_'));
  
  // Try a minimal prediction to test the token
  try {
    // Just validate the token by listing models (lightweight call)
    const response = await fetch('https://api.replicate.com/v1/models/cuuupid/idm-vton', {
      headers: { 'Authorization': `Token ${token}` }
    });
    const data = await response.json();
    if (response.ok) {
      console.log('✅ Replicate token is VALID. Model found:', data.name);
    } else {
      console.error('❌ Replicate token FAILED:', data.detail || JSON.stringify(data));
    }
  } catch (err) {
    console.error('❌ Replicate fetch error:', err.message);
  }
}

async function testCloudinary() {
  console.log('\n=== CLOUDINARY TEST ===');
  const { v2: cdn } = await import('cloudinary');
  cdn.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  try {
    const result = await cdn.api.ping();
    console.log('✅ Cloudinary is VALID:', result.status);
  } catch (err) {
    console.error('❌ Cloudinary FAILED:', err.message || JSON.stringify(err.error));
  }
}

await testCloudinary();
await testReplicate();
