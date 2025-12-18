import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  // Let what we are validating show in the Log
  console.log('VALIDATION CHECK');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Has errors:', !errors.isEmpty());

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => `${err.path}: ${err.msg}`);

    console.log('Validation errors:', JSON.stringify(errors.array(), null, 2));

    logger.error('Validation failed:', {
      errors: errors.array(),
      body: req.body
    });

    return res.status(400).json({
      message: 'Validation failed',
      errors: errorMessages,
      details: errors.array(),
    });
  }

  console.log('Validation passed!');
  next();
};

