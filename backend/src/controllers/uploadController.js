import cloudinary from '../config/cloudinary.js';
import logger from '../utils/logger.js';
import Passenger from '../models/Passenger.js';
import Driver from '../models/Driver.js';

// @desc    Upload image to Cloudinary
// @route   POST /api/upload
// @access  Private
export const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Convert buffer to base64 data URI
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'comequick',
      resource_type: 'image',
      transformation: [
        {
          width: 1000,
          height: 1000,
          crop: 'limit',
          quality: 'auto',
        },
      ],
    });

    logger.info(`Image uploaded to Cloudinary: ${result.public_id}`);

    res.json({
      message: 'Image uploaded successfully',
      imageUrl: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    logger.error(`Upload image error: ${error.message}`);
    next(error);
  }
};

// @desc    Upload image and update profile
// @route   POST /api/upload/profile
// @access  Private
export const uploadAndUpdateProfile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Convert buffer to base64 data URI
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(base64Image, {
      folder: 'comequick/profiles',
      resource_type: 'image',
      transformation: [
        {
          width: 500,
          height: 500,
          crop: 'fill',
          gravity: 'face',
          quality: 'auto',
        },
      ],
    });

    logger.info(`Profile image uploaded to Cloudinary: ${result.public_id}`);

    // Update profile based on user type
    let user;
    if (req.passenger) {
      user = await Passenger.findById(req.passenger._id);
      user.profileImageUrl = result.secure_url;
      await user.save();
      logger.info(`Passenger profile image updated: ${user.email}`);
    } else if (req.driver) {
      user = await Driver.findById(req.driver._id);
      user.profileImageUrl = result.secure_url;
      await user.save();
      logger.info(`Driver profile image updated: ${user.phone}`);
    } else {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    res.json({
      message: 'Profile image uploaded and updated successfully',
      imageUrl: result.secure_url,
      publicId: result.public_id,
      user,
    });
  } catch (error) {
    logger.error(`Upload and update profile error: ${error.message}`);
    next(error);
  }
};

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/:publicId
// @access  Private
export const deleteImage = async (req, res, next) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({ message: 'Public ID is required' });
    }

    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      logger.info(`Image deleted from Cloudinary: ${publicId}`);
      res.json({
        message: 'Image deleted successfully',
      });
    } else {
      res.status(404).json({
        message: 'Image not found or already deleted',
      });
    }
  } catch (error) {
    logger.error(`Delete image error: ${error.message}`);
    next(error);
  }
};

