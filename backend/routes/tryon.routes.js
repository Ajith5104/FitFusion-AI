import express from 'express';
import { upload } from '../config/cloudinary.js';
import { processTryOn, getHistory, clearHistory } from '../controllers/tryon.controller.js';

const router = express.Router();

// Wrap multer to catch upload errors explicitly
const uploadMiddleware = (req, res, next) => {
  upload.fields([
    { name: 'garment', maxCount: 1 },
    { name: 'person', maxCount: 1 }
  ])(req, res, (err) => {
    if (err) {
      console.error('Multer/Cloudinary upload error:', err);
      return res.status(500).json({
        success: false,
        message: 'Image upload failed: ' + err.message,
      });
    }
    next();
  });
};

// Main endpoint for try-on - Guest only
router.post('/', uploadMiddleware, processTryOn);

// History endpoint
router.get('/history', getHistory);
router.delete('/history', clearHistory);

export default router;
