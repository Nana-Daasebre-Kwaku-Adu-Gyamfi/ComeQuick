import Passenger from '../models/Passenger.js';
import logger from '../utils/logger.js';

// @desc    Get passenger profile
// @route   GET /api/passengers/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const passenger = await Passenger.findById(req.passenger._id);
    res.json({ passenger });
  } catch (error) {
    logger.error(`Get profile error: ${error.message}`);
    next(error);
  }
};

// @desc    Update passenger profile
// @route   PUT /api/passengers/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const passenger = await Passenger.findById(req.passenger._id);

    if (name) passenger.name = name;
    if (phone) passenger.phone = phone;

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

