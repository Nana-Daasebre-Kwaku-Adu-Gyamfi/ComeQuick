import Passenger from '../models/Passenger.js';
import logger from '../utils/logger.js';

// Get passenger profile
// GET /api/passengers/profile
// Private
export const getProfile = async (req, res, next) => {
  try {
    const passenger = await Passenger.findById(req.passenger._id);
    res.json({ passenger });
  } catch (error) {
    logger.error(`Get profile error: ${error.message}`);
    next(error);
  }
};

// Update passenger profile
// PUT /api/passengers/profile
// Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, profileImageUrl } = req.body;
    const passenger = await Passenger.findById(req.passenger._id);

    if (name) passenger.name = name;
    if (phone) passenger.phone = phone;
    if (profileImageUrl) passenger.profileImageUrl = profileImageUrl;

    await passenger.save();

    logger.info(`Passenger profile updated: ${passenger.email}`);

    res.json({
      message: 'Profile updated successfully',
      passenger,
    });
  } catch (error) {
    logger.error(`Update profile error: ${error.message}`);
    next(error);
  }
};

