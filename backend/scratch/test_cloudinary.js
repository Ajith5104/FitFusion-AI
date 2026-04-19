import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function testConnection() {
  try {
    console.log('Testing Cloudinary connection with Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
    const result = await cloudinary.api.ping();
    console.log('Cloudinary connection SUCCESS:', result);
  } catch (error) {
    console.error('Cloudinary connection FAILED:');
    console.error(JSON.stringify(error, null, 2) || error);
  }
}

testConnection();
