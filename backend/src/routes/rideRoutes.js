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
  getPendingRides,
  rateDriver,
  getDriverRideHistory,
} from '../controllers/rideController.js';
import { protectPassenger, protectDriver } from '../middleware/auth.js';
import { handleValidationErrors } from '../middleware/validation.js';

const router = Router();

// Passenger routes - UPDATED VALIDATION (no locationId required)
const rideRequestValidationRules = [
  body('pickupLocation').trim().notEmpty().withMessage('Pickup location is required'),
  body('pickupCoordinates').exists().withMessage('Pickup coordinates are required'),
  body('pickupCoordinates.lat').exists().withMessage('Pickup latitude is required'),
  body('pickupCoordinates.lng').exists().withMessage('Pickup longitude is required'),
  body('destination').trim().notEmpty().withMessage('Destination is required'),
];

router.post('/request', protectPassenger, rideRequestValidationRules, handleValidationErrors, createRideRequest);
router.get('/active', protectPassenger, getActiveRide);
router.get('/history', protectPassenger, getRideHistory);
router.put('/:id/cancel', protectPassenger, cancelRide);
router.put('/:id/rate', protectPassenger, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
], handleValidationErrors, rateDriver);

// Driver routes (pending rides is public to encourage driver signups)
router.get('/pending', getPendingRides);
router.put('/:id/accept', protectDriver, acceptRide);
router.put('/:id/start', protectDriver, startRide);
router.put('/:id/complete', protectDriver, completeRide);
router.get('/driver/active', protectDriver, getDriverActiveRide);
router.get('/driver/history', protectDriver, getDriverRideHistory);

export default router;


