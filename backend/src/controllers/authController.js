import Passenger from '../models/Passenger.js';
import Admin from '../models/Admin.js';
import { generateToken } from '../utils/generateToken.js';
import logger from '../utils/logger.js';

// @desc    Register a new passenger
// @route   POST /api/auth/signup
// @access  Public
export const signup = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    // Check if passenger already exists
    const existingPassenger = await Passenger.findOne({ email });
    if (existingPassenger) {
      return res.status(400).json({ message: 'Passenger already exists with this email' });
    }

    // Create passenger (verified by default)
    const passenger = await Passenger.create({
      name,
      email,
      phone,
      password,
      isVerified: true, // Auto-verified, no OTP needed
    });

    logger.info(`New passenger registered: ${email}`);

    // Generate token for immediate login
    const token = generateToken(passenger._id);

    res.status(201).json({
      message: 'Passenger registered successfully',
      token,
      passenger: {
        id: passenger._id,
        name: passenger.name,
        email: passenger.email,
        phone: passenger.phone,
        isVerified: passenger.isVerified,
        profileImageUrl: passenger.profileImageUrl,
      },
    });
  } catch (error) {
    logger.error(`Signup error: ${error.message}`);
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Email already exists',
        field: Object.keys(error.keyPattern)[0]
      });
    }
    next(error);
  }
};

// @desc    Login passenger
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Convert email to lowercase to match database storage
    const normalizedEmail = email?.toLowerCase().trim();

    // Check if passenger exists and get password
    const passenger = await Passenger.findOne({ email: normalizedEmail }).select('+password');
    if (!passenger) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await passenger.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(passenger._id);

    logger.info(`Passenger logged in: ${email}`);

    res.json({
      message: 'Login successful',
      token,
      passenger: {
        id: passenger._id,
        name: passenger.name,
        email: passenger.email,
        phone: passenger.phone,
        isVerified: passenger.isVerified,
        profileImageUrl: passenger.profileImageUrl,
      },
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    next(error);
  }
};

// @desc    Get current passenger
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const passenger = await Passenger.findById(req.passenger._id);
    res.json({
      passenger,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login admin
// @route   POST /api/auth/admin/login
// @access  Public
export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.toLowerCase().trim();

    // Check if admin exists
    const admin = await Admin.findOne({ email: normalizedEmail });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(admin._id);

    logger.info(`Admin logged in: ${email}`);

    res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: 'admin'
      },
    });
  } catch (error) {
    logger.error(`Admin login error: ${error.message}`);
    next(error);
  }
};

