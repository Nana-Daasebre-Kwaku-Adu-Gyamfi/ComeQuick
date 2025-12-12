import jwt from 'jsonwebtoken';
import Passenger from '../models/Passenger.js';
import Driver from '../models/Driver.js';
import logger from '../utils/logger.js';

// Middleware to authenticate passengers
export const protectPassenger = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.passenger = await Passenger.findById(decoded.id).select('-password');
      
      if (!req.passenger) {
        return res.status(401).json({ message: 'Passenger not found' });
      }

      next();
    } catch (error) {
      logger.error(`JWT verification error: ${error.message}`);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Middleware to authenticate drivers
export const protectDriver = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.driver = await Driver.findById(decoded.id).select('-password');
      
      if (!req.driver) {
        return res.status(401).json({ message: 'Driver not found' });
      }

      next();
    } catch (error) {
      logger.error(`JWT verification error: ${error.message}`);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    return res.status(500).json({ message: 'Server error' });
  }
};

// Middleware to authenticate either passenger or driver
export const protectUser = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Try to find as passenger first
      const passenger = await Passenger.findById(decoded.id).select('-password');
      if (passenger) {
        req.passenger = passenger;
        req.userType = 'passenger';
        return next();
      }

      // If not passenger, try driver
      const driver = await Driver.findById(decoded.id).select('-password');
      if (driver) {
        req.driver = driver;
        req.userType = 'driver';
        return next();
      }

      return res.status(401).json({ message: 'User not found' });
    } catch (error) {
      logger.error(`JWT verification error: ${error.message}`);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    return res.status(500).json({ message: 'Server error' });
  }
};
