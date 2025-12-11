import { Router } from 'express';
import { body } from 'express-validator';
import {
  signup,
  login,
  verifyOTP,
  getMe,
} from '../controllers/authController.js';
import { protectPassenger } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Validation rules
const signupValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

const verifyOTPValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];

router.post('/signup', authLimiter, signupValidation, handleValidationErrors, signup);
router.post('/login', authLimiter, loginValidation, handleValidationErrors, login);
router.post('/verify-otp', verifyOTPValidation, handleValidationErrors, verifyOTP);
router.get('/me', protectPassenger, getMe);

export default router;

