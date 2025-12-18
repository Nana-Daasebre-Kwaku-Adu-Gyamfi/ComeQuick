import Passenger from '../models/Passenger.js';
import Driver from '../models/Driver.js';
import logger from '../utils/logger.js';

// Get all passengers
// GET /api/admin/passengers
// Private/Admin
export const getPassengers = async (req, res, next) => {
    try {
        const passengers = await Passenger.find().select('-password');
        res.json(passengers);
    } catch (error) {
        logger.error(`Get all passengers error: ${error.message}`);
        next(error);
    }
};

// Get all drivers
// GET /api/admin/drivers
// Private/Admin
export const getDrivers = async (req, res, next) => {
    try {
        const drivers = await Driver.find().select('-password');
        res.json(drivers);
    } catch (error) {
        logger.error(`Get all drivers error: ${error.message}`);
        next(error);
    }
};

// Toggle passenger suspension
// PUT /api/admin/passengers/:id/suspend
// Private/Admin
export const togglePassengerSuspension = async (req, res, next) => {
    try {
        const passenger = await Passenger.findById(req.params.id);

        if (!passenger) {
            return res.status(404).json({ message: 'Passenger not found' });
        }

        passenger.isSuspended = !passenger.isSuspended;
        await passenger.save();

        res.json({
            message: `Passenger ${passenger.isSuspended ? 'suspended' : 'activated'}`,
            passenger,
        });
    } catch (error) {
        logger.error(`Toggle passenger suspension error: ${error.message}`);
        next(error);
    }
};

// Delete passenger
// DELETE /api/admin/passengers/:id
// Private/Admin
export const deletePassenger = async (req, res, next) => {
    try {
        const passenger = await Passenger.findByIdAndDelete(req.params.id);

        if (!passenger) {
            return res.status(404).json({ message: 'Passenger not found' });
        }

        res.json({ message: 'Passenger removed' });
    } catch (error) {
        logger.error(`Delete passenger error: ${error.message}`);
        next(error);
    }
};

// Verify driver
// PUT /api/admin/drivers/:id/verify
// Private/Admin
export const verifyDriver = async (req, res, next) => {
    try {
        const driver = await Driver.findById(req.params.id);

        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        driver.isVerified = true;
        await driver.save();

        res.json({
            message: 'Driver verified',
            driver,
        });
    } catch (error) {
        logger.error(`Verify driver error: ${error.message}`);
        next(error);
    }
};

// Delete driver
// DELETE /api/admin/drivers/:id
// Private/Admin
export const deleteDriver = async (req, res, next) => {
    try {
        const driver = await Driver.findByIdAndDelete(req.params.id);

        if (!driver) {
            return res.status(404).json({ message: 'Driver not found' });
        }

        res.json({ message: 'Driver removed' });
    } catch (error) {
        logger.error(`Delete driver error: ${error.message}`);
        next(error);
    }
};
