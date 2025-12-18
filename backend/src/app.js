import express from 'express';
import helmet from 'helmet';
import apiRouter from './routes/index.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import logger from './utils/logger.js';

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
// Manual CORS configuration
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Vary', 'Origin');
  res.setHeader('X-CORS-Fix', 'Applied');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/', (req, res, next) => {
  // Skip rate limiting for pending rides endpoint
  if (req.path === '/rides/pending') {
    return next();
  }
  apiLimiter(req, res, next);
});

// Request logging
app.use((req, res, next) => {
  console.log(`\n=== INCOMING REQUEST ===`);
  console.log(`${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  console.log('-----blablablab-----\n');

  logger.info(`${req.method} ${req.path}`);
  next();
});

// Simple landing route
app.get('/', (req, res) => {
  res.json({
    message: 'ComeQuick API is running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      passengers: '/api/passengers',
      drivers: '/api/drivers',
      rides: '/api/rides',
    },
  });
});

// Mount all API routes under /api
app.use('/api', apiRouter);

// 404 and error handling middleware
app.use(notFound);
app.use(errorHandler);

export default app;

