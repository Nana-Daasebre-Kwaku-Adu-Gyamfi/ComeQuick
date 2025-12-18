import Driver from '../models/Driver.js';
import { generateToken } from '../utils/generateToken.js';
import logger from '../utils/logger.js';

// Register a new driver
// POST /api/drivers/register
// Public
export const registerDriver = async (req, res, next) => {
  try {
    const { name, phone, carModel, carColor, licensePlate, password } = req.body;

    // Check if driver already exists
    const existingDriver = await Driver.findOne({
      $or: [{ phone }, { licensePlate }],
    });

    if (existingDriver) {
      return res.status(400).json({
        message: 'Driver already exists with this phone or license plate',
      });
    }

    // Create driver
    const driver = await Driver.create({
      name,
      phone,
      carModel,
      carColor,
      licensePlate,
      password,
    });

    // Generate token for immediate login
    const token = generateToken(driver._id);

    logger.info(`New driver registered: ${phone}`);

    res.status(201).json({
      message: 'Driver registered successfully',
      token,
      driver: {
        id: driver._id,
        name: driver.name,
        phone: driver.phone,
        carModel: driver.carModel,
        carColor: driver.carColor,
        licensePlate: driver.licensePlate,
        isVerified: driver.isVerified,
        rating: driver.rating,
        ratingCount: driver.ratingCount,
        profileImageUrl: driver.profileImageUrl,
      },
    });
  } catch (error) {
    logger.error(`Driver registration error: ${error.message}`);
    next(error);
  }
};

// Login driver
// POST /api/drivers/login
// Public
export const loginDriver = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    const driver = await Driver.findOne({ phone }).select('+password');
    if (!driver) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await driver.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(driver._id);

    logger.info(`Driver logged in: ${phone}`);

    res.json({
      message: 'Login successful',
      token,
      driver: {
        id: driver._id,
        name: driver.name,
        phone: driver.phone,
        carModel: driver.carModel,
        carColor: driver.carColor,
        licensePlate: driver.licensePlate,
        isVerified: driver.isVerified,
        isAvailable: driver.isAvailable,
        rating: driver.rating,
        ratingCount: driver.ratingCount,
        profileImageUrl: driver.profileImageUrl,
      },
    });
  } catch (error) {
    logger.error(`Driver login error: ${error.message}`);
    next(error);
  }
};

// Verify driver
// POST /api/drivers/verify
export const verifyDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.driver._id);

    if (driver.isVerified) {
      return res.status(400).json({ message: 'Driver already verified' });
    }

    driver.isVerified = true;
    driver.verifiedAt = new Date();
    await driver.save();

    logger.info(`Driver verified: ${driver.phone}`);

    res.json({
      message: 'Driver verified successfully',
      driver: {
        id: driver._id,
        name: driver.name,
        phone: driver.phone,
        isVerified: driver.isVerified,
        verifiedAt: driver.verifiedAt,
      },
    });
  } catch (error) {
    logger.error(`Driver verification error: ${error.message}`);
    next(error);
  }
};

// Get driver profile
// GET /api/drivers/profile
export const getProfile = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.driver._id);
    res.json({ driver });
  } catch (error) {
    logger.error(`Get driver profile error: ${error.message}`);
    next(error);
  }
};

// Update driver profile
// PUT /api/drivers/profile
export const updateProfile = async (req, res, next) => {
  try {
    const { name, carModel, carColor, profileImageUrl } = req.body;
    const driver = await Driver.findById(req.driver._id);

    if (name) driver.name = name;
    if (carModel) driver.carModel = carModel;
    if (carColor) driver.carColor = carColor;
    if (profileImageUrl) driver.profileImageUrl = profileImageUrl;

    await driver.save();

    logger.info(`Driver profile updated: ${driver.phone}`);

    res.json({
      message: 'Profile updated successfully',
      driver,
    });
  } catch (error) {
    logger.error(`Update driver profile error: ${error.message}`);
    next(error);
  }
};

// Update driver availability
// PUT /api/drivers/availability
export const updateAvailability = async (req, res, next) => {
  try {
    const { isAvailable, locationId, locationName } = req.body;
    const driver = await Driver.findById(req.driver._id);

    if (typeof isAvailable === 'boolean') {
      driver.isAvailable = isAvailable;
    }
    if (locationId) driver.locationId = locationId;
    if (locationName) driver.locationName = locationName;

    await driver.save();

    logger.info(`Driver availability updated: ${driver.phone} - ${driver.isAvailable}`);

    res.json({
      message: 'Availability updated successfully',
      driver: {
        id: driver._id,
        isAvailable: driver.isAvailable,
        locationId: driver.locationId,
        locationName: driver.locationName,
      },
    });
  } catch (error) {
    logger.error(`Update availability error: ${error.message}`);
    next(error);
  }
};

// Get pending ride requests
// GET /api/drivers/requests
export const getPendingRequests = async (req, res, next) => {
  try {
    const Ride = (await import('../models/Ride.js')).default;
    const requests = await Ride.find({ status: 'pending' })
      .populate('passengerId', 'name phone')

      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ requests });
  } catch (error) {
    logger.error(`Get pending requests error: ${error.message}`);
    next(error);
  }
};

