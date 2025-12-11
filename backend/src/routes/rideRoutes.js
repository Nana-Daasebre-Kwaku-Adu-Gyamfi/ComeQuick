import { Router } from 'express';
import { body } from 'express-validator';
import {
  createRideRequest,
  getActiveRide,
  getRideHistory,
  cancelRide,
  acceptRide,
  startRide,
  completeRide,
  getDriverActiveRide,
} from '../controllers/rideController.js';
import { protectPassenger, protectDriver } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = Router();

// Passenger routes
const createRideValidation = [
  body('locationId').notEmpty().withMessage('Location ID is required'),
  body('pickupLocation').trim().notEmpty().withMessage('Pickup location is required'),
  body('destination').trim().notEmpty().withMessage('Destination is required'),
];

router.post('/request', protectPassenger, createRideValidation, handleValidationErrors, createRideRequest);
router.get('/active', protectPassenger, getActiveRide);
router.get('/history', protectPassenger, getRideHistory);
router.put('/:id/cancel', protectPassenger, cancelRide);

// Driver routes
const completeRideValidation = [
  body('fare').optional().isNumeric().withMessage('Fare must be a number'),
];

router.put('/:id/accept', protectDriver, acceptRide);
router.put('/:id/start', protectDriver, startRide);
router.put('/:id/complete', protectDriver, completeRideValidation, handleValidationErrors, completeRide);
router.get('/driver/active', protectDriver, getDriverActiveRide);

export default router;

