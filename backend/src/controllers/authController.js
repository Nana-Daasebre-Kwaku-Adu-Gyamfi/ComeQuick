import Passenger from '../models/Passenger.js';
import { generateToken } from '../utils/generateToken.js';
import logger from '../utils/logger.js';

// Generate OTP (simple 6-digit code)
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

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

    // Generate OTP
    const otpCode = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create passenger
    const passenger = await Passenger.create({
      name,
      email,
      phone,
      password,
      otp: {
        code: otpCode,
        expiresAt: otpExpires,
      },
    });

    logger.info(`New passenger registered: ${email}`);

    res.status(201).json({
      message: 'Passenger registered successfully. Please verify OTP.',
      passenger: {
        id: passenger._id,
        name: passenger.name,
        email: passenger.email,
        phone: passenger.phone,
        isVerified: passenger.isVerified,
      },
      // In production, send OTP via SMS/Email
      otp: process.env.NODE_ENV === 'development' ? otpCode : undefined,
    });
  } catch (error) {
    logger.error(`Signup error: ${error.message}`);
    next(error);
  }
};

// @desc    Login passenger
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if passenger exists and get password
    const passenger = await Passenger.findOne({ email }).select('+password');
    if (!passenger) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await passenger.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
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
      },
    });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    next(error);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const passenger = await Passenger.findOne({ email });
    if (!passenger) {
      return res.status(404).json({ message: 'Passenger not found' });
    }

    if (passenger.isVerified) {
      return res.status(400).json({ message: 'Passenger already verified' });
    }

    if (!passenger.otp || !passenger.otp.code) {
      return res.status(400).json({ message: 'No OTP found. Please request a new one.' });
    }

    if (passenger.otp.code !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > passenger.otp.expiresAt) {
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Verify passenger
    passenger.isVerified = true;
    passenger.otp = undefined;
    await passenger.save();

    logger.info(`Passenger verified: ${email}`);

    res.json({
      message: 'OTP verified successfully',
      passenger: {
        id: passenger._id,
        name: passenger.name,
        email: passenger.email,
        phone: passenger.phone,
        isVerified: passenger.isVerified,
      },
    });
  } catch (error) {
    logger.error(`OTP verification error: ${error.message}`);
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
    logger.error(`Get me error: ${error.message}`);
    next(error);
  }
};

