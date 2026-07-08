import express from 'express';
import { getAssetsByFolder } from '../services/cloudinaryService.js';

const router = express.Router();

/**
 * @route GET /api/ui/images/:folder
 * @desc Get all images from a specific Cloudinary folder (used for dynamic UI content)
 * @access Public
 */
router.get('/images/:folder', async (req, res) => {
  try {
    const { folder } = req.params;
    
    if (!folder) {
      return res.status(400).json({ message: 'Folder name is required' });
    }

    const images = await getAssetsByFolder(folder);
    
    res.json({
      success: true,
      folder,
      count: images.length,
      images
    });
  } catch (error) {
    console.error(`Error fetching UI images for folder ${req.params.folder}:`, error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch UI images', 
      error: error.message 
    });
  }
});

export default router;
