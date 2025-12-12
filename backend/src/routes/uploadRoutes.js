import { Router } from 'express';
import { uploadImage, deleteImage } from '../controllers/uploadController.js';
import { protectUser } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = Router();

// Upload image (both passengers and drivers can use)
router.post('/', protectUser, upload.single('image'), uploadImage);

// Delete image (both passengers and drivers can use)
router.delete('/:publicId', protectUser, deleteImage);

export default router;

