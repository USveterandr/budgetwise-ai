const express = require('express');
const authRoutes = require('./routes/authRoutes');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cookieParser());
app.use(express.json());

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes by default
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || 5), // Limit each IP to 5 requests per window
  message: 'Too many login attempts, please try again later'
});

// Apply to auth routes
app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);

// CSRF protection is currently disabled due to helmet.csrf() not being available
// To enable CSRF protection, consider using the 'csurf' package or alternative methods
// app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
// app.use(helmet.csrf({})); // This line causes error: helmet.csrf is not a function

// CSRF token endpoint temporarily removed
// app.get('/csrf-token', (req, res) => {
//   res.json({ csrfToken: req.csrfToken() });
// });

// Add centralized Supabase configuration
const { createSupabaseClient, checkSupabaseConnection } = require('./lib/supabase');

// Use centralized Supabase client
const supabase = createSupabaseClient();

// Add health check route
app.get('/health', async (req, res) => {
  const health = await checkSupabaseConnection();
  
  res.status(health.status === 'connected' ? 200 : 503).json({
    database: health
  });
});

// Add Supabase to locals for routes
app.locals.supabase = supabase;

// Routes
app.use('/auth', authRoutes);

// Add enhanced logging
const logger = require('./utils/logger');

// Log server start
logger.info('Server starting', {
  env: process.env.NODE_ENV || 'development',
  port: PORT
});

// Replace basic logging with enhanced logging
// Log all requests in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    logger.debug(`Incoming request: ${req.method} ${req.url}`, {
      ip: req.ip,
      headers: req.headers
    });
    next();
  });
}

// Log errors
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.message}`, {
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  });
  next(err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
