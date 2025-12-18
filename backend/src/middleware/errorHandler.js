import logger from '../utils/logger.js';

const errorHandler = (err, req, res) => {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    statusCode,
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
  });
};

export default errorHandler;

