import { Router } from 'express';
import { body } from 'express-validator';
import {
  signup,
  login,
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

router.post('/signup', authLimiter, signupValidation, handleValidationErrors, signup);
router.post('/login', authLimiter, loginValidation, handleValidationErrors, login);
router.get('/me', protectPassenger, getMe);

export default router;

