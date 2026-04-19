import { processTryOn } from '../controllers/tryon.controller.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Mock req and res
const req = {
  files: {
    garment: [{ path: 'https://res.cloudinary.com/demo/image/upload/sample.jpg' }],
    person: [{ path: 'https://res.cloudinary.com/demo/image/upload/sample.jpg' }]
  },
  body: {
    description: 'Test try-on'
  }
};

const res = {
  status: (code) => {
    console.log('Response Status:', code);
    return res;
  },
  json: (data) => {
    console.log('Response JSON:', JSON.stringify(data, null, 2));
    return res;
  }
};

async function testController() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('DB Connected for test');
    
    await processTryOn(req, res);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Test CRASHED:', error);
  }
}

testController();
