import Ride from '../models/Ride.js';
import Driver from '../models/Driver.js';
import logger from '../utils/logger.js';

// Create a ride request
// POST /api/rides/request
export const createRideRequest = async (req, res, next) => {
  try {
    const { locationId, pickupLocation, pickupCoordinates, destination, destinationCoordinates, requestedTime } = req.body;

    // Log the incoming request for debugging
    logger.info('Creating ride request:', {
      passengerId: req.passenger._id,
      pickupLocation,
      pickupCoordinates,
      destination,
      requestedTime
    });

    // Validate required fields
    if (!pickupLocation || pickupLocation.trim() === '') {
      return res.status(400).json({ message: 'Pickup location is required' });
    }

    if (!destination || destination.trim() === '') {
      return res.status(400).json({ message: 'Destination is required' });
    }

    // Validate coordinates
    if (!pickupCoordinates || !pickupCoordinates.lat || !pickupCoordinates.lng) {
      return res.status(400).json({
        message: 'Pickup coordinates are required',
        received: pickupCoordinates
      });
    }

    // Validate coordinate values
    const lat = parseFloat(pickupCoordinates.lat);
    const lng = parseFloat(pickupCoordinates.lng);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        message: 'Invalid pickup coordinates',
        received: { lat: pickupCoordinates.lat, lng: pickupCoordinates.lng }
      });
    }

    const ride = await Ride.create({
      passengerId: req.passenger._id,
      locationId: locationId || null,
      pickupLocation: pickupLocation.trim(),
      pickupCoordinates: {
        lat,
        lng,
      },
      destination: destination.trim(),
      destinationCoordinates: destinationCoordinates ? {
        lat: parseFloat(destinationCoordinates.lat),
        lng: parseFloat(destinationCoordinates.lng),
      } : null,
      requestedTime: requestedTime ? new Date(requestedTime) : new Date(),
      status: 'pending',
    });

    const populatedRide = await Ride.findById(ride._id)
      .populate('passengerId', 'name phone');

    logger.info(`Ride request created: ${ride._id}`);

    res.status(201).json({
      message: 'Ride request created successfully',
      ride: populatedRide,
    });
  } catch (error) {
    logger.error(`Create ride request error: ${error.message}`);

    // Send validation errors with more detail
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Validation failed',
        errors,
        details: error.message
      });
    }

    next(error);
  }
};

// Get passenger's active ride
// GET /api/rides/active
export const getActiveRide = async (req, res, next) => {
  try {
    const ride = await Ride.findOne({
      passengerId: req.passenger._id,
      status: { $in: ['pending', 'matched', 'in_progress'] },
    })
      .populate('driverId', 'name phone carModel carColor licensePlate rating profileImageUrl')

      .sort({ createdAt: -1 });

    if (!ride) {
      return res.json({ ride: null });
    }

    res.json({ ride });
  } catch (error) {
    logger.error(`Get active ride error: ${error.message}`);
    next(error);
  }
};

// Get passenger's ride history
// GET /api/rides/history
export const getRideHistory = async (req, res, next) => {
  try {
    const rides = await Ride.find({
      passengerId: req.passenger._id,
      status: { $in: ['completed', 'cancelled'] },
    })
      .populate('driverId', 'name phone carModel carColor licensePlate rating profileImageUrl')

      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ rides, count: rides.length });
  } catch (error) {
    logger.error(`Get ride history error: ${error.message}`);
    next(error);
  }
};

// Cancel a ride
// PUT /api/rides/:id/cancel
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

// Accept a ride request (Driver)
// PUT /api/rides/:id/accept
export const acceptRide = async (req, res, next) => {
  try {
    const { id } = req.params;
    console.log('=== ACCEPT RIDE ===');
    console.log('Ride ID:', id);
    console.log('Driver ID:', req.driver._id);

    const driver = await Driver.findById(req.driver._id);
    console.log('Driver found:', driver ? driver.name : 'NOT FOUND');
    console.log('Driver isAvailable:', driver?.isAvailable);

    const ride = await Ride.findById(id);
    console.log('Ride found:', ride ? ride._id : 'NOT FOUND');
    console.log('Ride status:', ride?.status);

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.status !== 'pending') {
      console.log('ERROR: Ride status is not pending, it is:', ride.status);
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
      .populate('passengerId', 'name phone profileImageUrl')
      .populate('driverId', 'name phone carModel carColor licensePlate profileImageUrl')
      ;

    logger.info(`Ride accepted: ${ride._id} by driver ${driver.phone}`);
    console.log('SUCCESS: Ride accepted');

    res.json({
      message: 'Ride accepted successfully',
      ride: populatedRide,
    });
  } catch (error) {
    console.log('ERROR in acceptRide:', error.message);
    logger.error(`Accept ride error: ${error.message}`);
    next(error);
  }
};

// Start a ride (Driver)
// PUT /api/rides/:id/start
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

// Complete a ride (Driver)
// PUT /api/rides/:id/complete
export const completeRide = async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log('=== COMPLETE RIDE ===');
    console.log('Ride ID:', id);
    console.log('Driver ID:', req.driver._id);

    const ride = await Ride.findOne({
      _id: id,
      driverId: req.driver._id,
    });

    console.log('Ride found:', ride ? ride._id : 'NOT FOUND');
    console.log('Ride status:', ride?.status);

    if (!ride) {
      console.log('ERROR: Ride not found');
      return res.status(404).json({ message: 'Ride not found' });
    }

    // Allow completing rides that are matched or in_progress
    if (ride.status !== 'in_progress' && ride.status !== 'matched') {
      console.log('ERROR: Ride status is not in_progress or matched, it is:', ride.status);
      return res.status(400).json({ message: 'Ride cannot be completed. Current status: ' + ride.status });
    }

    ride.status = 'completed';
    ride.completedAt = new Date();
    await ride.save();

    const driver = await Driver.findById(req.driver._id);
    driver.isAvailable = true;
    driver.currentRideId = null;
    await driver.save();

    const populatedRide = await Ride.findById(ride._id)
      .populate('passengerId', 'name phone profileImageUrl')
      .populate('driverId', 'name phone carModel carColor licensePlate profileImageUrl')
      ;

    logger.info(`Ride completed: ${ride._id}`);
    console.log('SUCCESS: Ride completed');

    res.json({
      message: 'Ride completed successfully',
      ride: populatedRide,
    });
  } catch (error) {
    console.log('ERROR in completeRide:', error.message);
    logger.error(`Complete ride error: ${error.message}`);
    next(error);
  }
};

// Get driver's active ride
// GET /api/rides/driver/active
export const getDriverActiveRide = async (req, res, next) => {
  try {
    const ride = await Ride.findOne({
      driverId: req.driver._id,
      status: { $in: ['matched', 'in_progress'] },
    })
      .populate('passengerId', 'name phone profileImageUrl')

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

// Get all pending rides for drivers
// GET /api/rides/pending
export const getPendingRides = async (req, res, next) => {
  try {
    const rides = await Ride.find({
      status: 'pending',
      driverId: null,
    })
      .populate('passengerId', 'name phone profileImageUrl')

      .sort({ createdAt: -1 })
      .limit(50);

    logger.info(`Fetched ${rides.length} pending rides`);

    res.json({
      rides,
      count: rides.length
    });
  } catch (error) {
    logger.error(`Get pending rides error: ${error.message}`);
    next(error);
  }
};

// Rate a driver after ride completion
// PUT /api/rides/:id/rate
export const rateDriver = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    console.log('=== RATE DRIVER ===');
    console.log('Ride ID:', id);
    console.log('Rating:', rating);

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const ride = await Ride.findOne({
      _id: id,
      passengerId: req.passenger._id,
      status: { $in: ['completed', 'matched', 'in_progress'] },
    });

    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.rating) {
      return res.status(400).json({ message: 'Ride already rated' });
    }

    // Update ride with rating and status
    ride.rating = rating;
    if (ride.status !== 'completed') {
      ride.status = 'completed';
      ride.completedAt = new Date();
    }
    await ride.save();

    // Update driver's average rating
    const driver = await Driver.findById(ride.driverId);
    if (driver) {
      // Free driver if they were assigned to this ride
      if (driver.currentRideId && driver.currentRideId.toString() === ride._id.toString()) {
        driver.isAvailable = true;
        driver.currentRideId = null;
      }

      driver.totalRatings += rating;
      driver.ratingCount += 1;
      driver.rating = Math.round((driver.totalRatings / driver.ratingCount) * 10) / 10;
      await driver.save();
      console.log(`Driver ${driver.name} new rating: ${driver.rating.toFixed(1)}`);
    }

    logger.info(`Ride ${ride._id} rated: ${rating} stars`);
    console.log('SUCCESS: Driver rated');

    res.json({
      message: 'Rating submitted successfully',
      ride,
      driverRating: driver?.rating,
    });
  } catch (error) {
    console.log('ERROR in rateDriver:', error.message);
    logger.error(`Rate driver error: ${error.message}`);
    next(error);
  }
};

// Get driver's ride history
// GET /api/rides/driver/history
export const getDriverRideHistory = async (req, res, next) => {
  try {
    const rides = await Ride.find({
      driverId: req.driver._id,
      status: 'completed',
    })
      .populate('passengerId', 'name phone')
      .sort({ completedAt: -1 })
      .limit(50);

    logger.info(`Fetched ${rides.length} completed rides for driver ${req.driver._id}`);

    res.json({
      rides,
      count: rides.length,
    });
  } catch (error) {
    logger.error(`Get driver ride history error: ${error.message}`);
    next(error);
  }
};
