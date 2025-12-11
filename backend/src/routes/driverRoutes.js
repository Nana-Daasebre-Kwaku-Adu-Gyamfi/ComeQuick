import { Router } from 'express';
import { body } from 'express-validator';
import {
  registerDriver,
  loginDriver,
  verifyDriver,
  getProfile,
  updateProfile,
  updateAvailability,
  getPendingRequests,
} from '../controllers/driverController.js';
import { protectDriver } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public routes
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('carModel').trim().notEmpty().withMessage('Car model is required'),
  body('carColor').trim().notEmpty().withMessage('Car color is required'),
  body('licensePlate').trim().notEmpty().withMessage('License plate is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const loginValidation = [
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/register', authLimiter, registerValidation, handleValidationErrors, registerDriver);
router.post('/login', authLimiter, loginValidation, handleValidationErrors, loginDriver);

// Protected routes
router.use(protectDriver);

const updateProfileValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('carModel').optional().trim().notEmpty().withMessage('Car model cannot be empty'),
  body('carColor').optional().trim().notEmpty().withMessage('Car color cannot be empty'),
];

router.post('/verify', verifyDriver);
router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, handleValidationErrors, updateProfile);
router.put('/availability', updateAvailability);
router.get('/requests', getPendingRequests);

export default router;

