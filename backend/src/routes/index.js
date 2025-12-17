import { Router } from 'express';
import { healthCheck } from '../controllers/healthController.js';
import authRoutes from './authRoutes.js';
import passengerRoutes from './passengerRoutes.js';
import driverRoutes from './driverRoutes.js';
import rideRoutes from './rideRoutes.js';
import uploadRoutes from './uploadRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = Router();

// Health check endpoint
router.get('/health', healthCheck);

// API routes
router.use('/auth', authRoutes);
router.use('/passengers', passengerRoutes);
router.use('/drivers', driverRoutes);
router.use('/rides', rideRoutes);
router.use('/upload', uploadRoutes);
router.use('/admin', adminRoutes);

export default router;

