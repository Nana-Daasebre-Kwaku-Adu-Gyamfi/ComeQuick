import { Router } from 'express';
import { healthCheck } from '../controllers/healthController.js';
import authRoutes from './authRoutes.js';
import passengerRoutes from './passengerRoutes.js';
import driverRoutes from './driverRoutes.js';
import rideRoutes from './rideRoutes.js';

const router = Router();

// Health check endpoint
router.get('/health', healthCheck);

// API routes
router.use('/auth', authRoutes);
router.use('/passengers', passengerRoutes);
router.use('/drivers', driverRoutes);
router.use('/rides', rideRoutes);

export default router;

