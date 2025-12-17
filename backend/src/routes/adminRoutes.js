import { Router } from 'express';
import {
    getPassengers,
    getDrivers,
    togglePassengerSuspension,
    deletePassenger,
    verifyDriver,
    deleteDriver,
} from '../controllers/adminController.js';
import { protectAdmin } from '../middleware/auth.js';

const router = Router();

// Protect all routes
router.use(protectAdmin);

router.get('/passengers', getPassengers);
router.put('/passengers/:id/suspend', togglePassengerSuspension);
router.delete('/passengers/:id', deletePassenger);

router.get('/drivers', getDrivers);
router.put('/drivers/:id/verify', verifyDriver);
router.delete('/drivers/:id', deleteDriver);

export default router;
