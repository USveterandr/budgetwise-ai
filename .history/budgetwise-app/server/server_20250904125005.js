import express from 'express';
import { createClient } from '@supabase/supabase-js';
import authRoutes from './routes/authRoutes';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import 'dotenv/config';

const app = express();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials! Check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('Supabase client initialized');

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

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'BudgetWise API server is running',
    version: '1.0.0',
    endpoints: {
      auth: {
        login: '/auth/login',
        register: '/auth/register'
      }
    }
  });
});

// Routes
app.use('/auth', authRoutes);

// Basic logging for server start
console.log('Server starting', {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000
});

// Basic request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
  });
}

// Basic error logging
app.use((err, req, res, next) => {
  console.error(`Unhandled error: ${err.message}`, {
    stack: err.stack,
    url: req.url,
    method: req.method
  });
  next(err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
