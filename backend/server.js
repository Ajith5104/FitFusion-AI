import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Routes
import tryOnRoutes from './routes/tryon.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'FitFusion-AI Backend is running' });
});

// API Routes
app.use('/api/tryon', tryOnRoutes);

// Database Connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => {
      console.error('MongoDB connection error:', err);
      if (err.message.includes('ECONNREFUSED')) {
        console.error('TIP: This often means DNS cannot resolve the hostname. Check if you are on a VPN or restricted network, or try the Standard Connection String (without +srv).');
      }
    });
} else {
  console.warn('MONGODB_URI not found in .env, history features will be disabled.');
}

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);
  res.status(err.status || 500).json({ 
    success: false, 
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
