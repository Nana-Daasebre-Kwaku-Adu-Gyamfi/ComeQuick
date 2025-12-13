// Add these new controller functions at the end of rideController.js

// @desc    Rate a driver after ride completion
// @route   PUT /api/rides/:id/rate
// @access  Private (Passenger)
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
            status: 'completed',
        });

        if (!ride) {
            return res.status(404).json({ message: 'Ride not found or not completed' });
        }

        if (ride.rating) {
            return res.status(400).json({ message: 'Ride already rated' });
        }

        // Update ride with rating
        ride.rating = rating;
        await ride.save();

        // Update driver's average rating
        const driver = await Driver.findById(ride.driverId);
        if (driver) {
            driver.totalRatings += rating;
            driver.ratingCount += 1;
            driver.rating = driver.totalRatings / driver.ratingCount;
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

// @desc    Get driver's ride history
// @route   GET /api/rides/driver/history
// @access  Private (Driver)
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
