import { runVirtualTryOn } from '../services/replicateService.js';
import TryOn from '../models/TryOn.js';

// @desc    Process try-on request
// @route   POST /api/tryon
export const processTryOn = async (req, res) => {
  try {
    const files = req.files;

    // --- DEBUG: Log what we received ---
    console.log('=== /api/tryon called ===');
    console.log('Files received:', files ? JSON.stringify(Object.keys(files)) : 'NONE');
    if (files?.garment) console.log('Garment file[0]:', JSON.stringify(files.garment[0]));
    if (files?.person)  console.log('Person  file[0]:', JSON.stringify(files.person[0]));

    if (!files || !files.garment || !files.person || files.garment.length === 0 || files.person.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload both garment and person images.',
      });
    }

    // Cloudinary returns the public URL in `path` (via multer-storage-cloudinary)
    const garmentUrl = files.garment[0].path;
    const personUrl  = files.person[0].path;
    const { description } = req.body;

    if (!garmentUrl || !personUrl) {
      return res.status(500).json({
        success: false,
        message: 'Cloudinary upload succeeded but URL is missing. Check Cloudinary config.',
      });
    }

    console.log('Cloudinary URLs:', { garmentUrl, personUrl });

    // --- Trigger AI Model ---
    const customHfToken = req.headers['x-hf-token'];
    const customReplicateToken = req.headers['x-replicate-token'];

    let resultUrl;
    try {
      resultUrl = await runVirtualTryOn(garmentUrl, personUrl, {
        description,
        customHfToken,
        customReplicateToken
      });
      console.log('AI result URL:', resultUrl);
    } catch (aiError) {
      console.error('AI Service Error:', aiError.message);
      return res.status(502).json({
        success: false,
        message: 'AI Generation Failed: ' + aiError.message,
      });
    }

    if (!resultUrl) {
      return res.status(500).json({
        success: false,
        message: 'AI model returned no result URL.',
      });
    }

    // --- Save to Database (best-effort) ---
    try {
      await TryOn.create({
        garmentUrl,
        personUrl,
        resultUrl,
        description: description || 'Virtual Try-On result',
      });
    } catch (dbError) {
      console.warn('DB save failed (non-fatal):', dbError.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Try-on generated successfully',
      resultUrl,
    });

  } catch (error) {
    console.error('Unhandled Controller Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Unexpected server error',
    });
  }
};

// @desc    Get try-on history
// @route   GET /api/tryon/history
export const getHistory = async (req, res) => {
  try {
    const history = await TryOn.find().sort({ createdAt: -1 }).limit(10);
    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch history: ' + error.message,
    });
  }
};

// @desc    Clear all try-on history
// @route   DELETE /api/tryon/history
export const clearHistory = async (req, res) => {
  try {
    await TryOn.deleteMany({});
    res.status(200).json({
      success: true,
      message: 'History cleared successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear history: ' + error.message,
    });
  }
};
