import mongoose from 'mongoose';

const rideSchema = new mongoose.Schema(
  {
    passengerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Passenger',
      required: [true, 'Passenger ID is required'],
    },
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      default: null,
    },
    locationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Location',
      default: null, 
    },
    pickupLocation: {
      type: String,
      required: [true, 'Pickup location is required'],
      trim: true,
    },
    pickupCoordinates: {
      lat: {
        type: Number,
        required: [true, 'Pickup latitude is required'],
      },
      lng: {
        type: Number,
        required: [true, 'Pickup longitude is required'],
      },
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    destinationCoordinates: {
      lat: {
        type: Number,
        default: null,
      },
      lng: {
        type: Number,
        default: null,
      },
    },
    requestedTime: {
      type: Date,
      required: [true, 'Requested time is required'],
    },
    status: {
      type: String,
      enum: ['pending', 'matched', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
    acceptedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    cancellationReason: {
      type: String,
      default: null,
    },
    fare: {
      type: Number,
      default: null,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    review: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index added for efficient queries
rideSchema.index({ passengerId: 1, status: 1 });
rideSchema.index({ driverId: 1, status: 1 });
rideSchema.index({ status: 1 });
rideSchema.index({ 'pickupCoordinates.lat': 1, 'pickupCoordinates.lng': 1 });

const Ride = mongoose.model('Ride', rideSchema);

export default Ride;

