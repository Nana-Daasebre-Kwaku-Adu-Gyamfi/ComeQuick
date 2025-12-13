import 'dotenv/config';
import app from './app.js';
import connectDB from './config/database.js';
import logger from './utils/logger.js';

// Environment variables are now loaded automatically


const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// Start server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});

