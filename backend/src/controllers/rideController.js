import Ride from '../models/Ride.js';
import Driver from '../models/Driver.js';
import logger from '../utils/logger.js';

// @desc    Create a ride request
// @route   POST /api/rides/request
// @access  Private (Passenger)
export const createRideRequest = async (req, res, next) => {
  try {
    const { locationId, pickupLocation, destination, requestedTime } = req.body;

    const ride = await Ride.create({
      passengerId: req.passenger._id,
      locationId,
      pickupLocation,
      destination,
      requestedTime: requestedTime || new Date(),
      status: 'pending',
    });

    const populatedRide = await Ride.findById(ride._id)
      .populate('passengerId', 'name phone')
      .populate('locationId', 'name coordinates');

    logger.info(`Ride request created: ${ride._id}`);

    res.status(201).json({
      message: 'Ride request created successfully',
      ride: populatedRide,
    });
  } catch (error) {
    logger.error(`Create ride request error: ${error.message}`);
    next(error);
  }
};

// @desc    Get passenger's active ride
// @route   GET /api/rides/active
// @access  Private (Passenger)
export const getActiveRide = async (req, res, next) => {
  try {
    const ride = await Ride.findOne({
      passengerId: req.passenger._id,
      status: { $in: ['pending', 'matched', 'in_progress'] },
    })
      .populate('driverId', 'name phone carModel carColor licensePlate rating')
      .populate('locationId', 'name coordinates')
      .sort({ createdAt: -1 });

    if (!ride) {
      return res.status(404).json({ message: 'No active ride found' });
    }

    res.json({ ride });
  } catch (error) {
    logger.error(`Get active ride error: ${error.message}`);
    next(error);
  }
};

// @desc    Get passenger's ride history
// @route   GET /api/rides/history
// @access  Private (Passenger)
export const getRideHistory = async (req, res, next) => {
  try {
    const rides = await Ride.find({
      passengerId: req.passenger._id,
      status: { $in: ['completed', 'cancelled'] },
    })
      .populate('driverId', 'name phone carModel carColor licensePlate rating')
      .populate('locationId', 'name coordinates')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ rides, count: rides.length });
  } catch (error) {
    logger.error(`Get ride history error: ${error.message}`);
    next(error);
  }
};

// @desc    Cancel a ride
// @route   PUT /api/rides/:id/cancel
// @access  Private (Passenger)
export const cancelRide = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const ride = await Ride.findOne({
      _id: id,
      passengerId: req.passenger._id,
    });

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.status === 'completed' || ride.status === 'cancelled') {
      return res.status(400).json({ message: 'Ride cannot be cancelled' });
    }

    ride.status = 'cancelled';
    ride.cancelledAt = new Date();
    if (reason) ride.cancellationReason = reason;

    // If driver was assigned, make them available again
    if (ride.driverId) {
      await Driver.findByIdAndUpdate(ride.driverId, {
        isAvailable: true,
        currentRideId: null,
      });
    }

    await ride.save();

    logger.info(`Ride cancelled: ${ride._id}`);

    res.json({
      message: 'Ride cancelled successfully',
      ride,
    });
  } catch (error) {
    logger.error(`Cancel ride error: ${error.message}`);
    next(error);
  }
};

// @desc    Accept a ride request (Driver)
// @route   PUT /api/rides/:id/accept
// @access  Private (Driver)
export const acceptRide = async (req, res, next) => {
  try {
    const { id } = req.params;
    const driver = await Driver.findById(req.driver._id);

    if (!driver.isAvailable) {
      return res.status(400).json({ message: 'Driver is not available' });
    }

    const ride = await Ride.findById(id);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.status !== 'pending') {
      return res.status(400).json({ message: 'Ride is not available for acceptance' });
    }

    ride.driverId = driver._id;
    ride.status = 'matched';
    ride.acceptedAt = new Date();
    await ride.save();

    driver.isAvailable = false;
    driver.currentRideId = ride._id;
    await driver.save();

    const populatedRide = await Ride.findById(ride._id)
      .populate('passengerId', 'name phone')
      .populate('driverId', 'name phone carModel carColor licensePlate')
      .populate('locationId', 'name coordinates');

    logger.info(`Ride accepted: ${ride._id} by driver ${driver.phone}`);

    res.json({
      message: 'Ride accepted successfully',
      ride: populatedRide,
    });
  } catch (error) {
    logger.error(`Accept ride error: ${error.message}`);
    next(error);
  }
};

// @desc    Start a ride (Driver)
// @route   PUT /api/rides/:id/start
// @access  Private (Driver)
export const startRide = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ride = await Ride.findOne({
      _id: id,
      driverId: req.driver._id,
    });

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.status !== 'matched') {
      return res.status(400).json({ message: 'Ride cannot be started' });
    }

    ride.status = 'in_progress';
    await ride.save();

    logger.info(`Ride started: ${ride._id}`);

    res.json({
      message: 'Ride started successfully',
      ride,
    });
  } catch (error) {
    logger.error(`Start ride error: ${error.message}`);
    next(error);
  }
};

// @desc    Complete a ride (Driver)
// @route   PUT /api/rides/:id/complete
// @access  Private (Driver)
export const completeRide = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fare } = req.body;
    const ride = await Ride.findOne({
      _id: id,
      driverId: req.driver._id,
    });

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.status !== 'in_progress') {
      return res.status(400).json({ message: 'Ride cannot be completed' });
    }

    ride.status = 'completed';
    ride.completedAt = new Date();
    if (fare) ride.fare = fare;
    await ride.save();

    const driver = await Driver.findById(req.driver._id);
    driver.isAvailable = true;
    driver.currentRideId = null;
    await driver.save();

    const populatedRide = await Ride.findById(ride._id)
      .populate('passengerId', 'name phone')
      .populate('driverId', 'name phone carModel carColor licensePlate')
      .populate('locationId', 'name coordinates');

    logger.info(`Ride completed: ${ride._id}`);

    res.json({
      message: 'Ride completed successfully',
      ride: populatedRide,
    });
  } catch (error) {
    logger.error(`Complete ride error: ${error.message}`);
    next(error);
  }
};

// @desc    Get driver's active ride
// @route   GET /api/rides/driver/active
// @access  Private (Driver)
export const getDriverActiveRide = async (req, res, next) => {
  try {
    const ride = await Ride.findOne({
      driverId: req.driver._id,
      status: { $in: ['matched', 'in_progress'] },
    })
      .populate('passengerId', 'name phone')
      .populate('locationId', 'name coordinates')
      .sort({ createdAt: -1 });

    if (!ride) {
      return res.status(404).json({ message: 'No active ride found' });
    }

    res.json({ ride });
  } catch (error) {
    logger.error(`Get driver active ride error: ${error.message}`);
    next(error);
  }
};

