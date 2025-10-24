const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Load environment variables
dotenv.config();

// Import database connection
const connectDB = require('./src/config/db');

// Import routes
const authRoutes = require('./src/routes/auth');
const scholarshipRoutes = require('./src/routes/scholarships');
const organizationRoutes = require('./src/routes/organizations');
const applicationRoutes = require('./src/routes/applications');
const userRoutes = require('./src/routes/user');
const uploadRoutes = require('./src/routes/upload');
const adminRoutes = require('./src/routes/admin');

// Import middleware
const errorHandler = require('./src/middleware/errorHandler');

// Connect to database
connectDB();

const app = express();

// CORS configuration - MUST come before other middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173', 
    'http://localhost:5174',
    'http://10.185.173.7:5173', // Network IP access
    /^http:\/\/192\.168\.\d+\.\d+:5173$/, // Local network range
    /^http:\/\/10\.\d+\.\d+\.\d+:5173$/ // Network IP range
  ],
  credentials: true,
 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-requested-with']
}));

// Handle preflight OPTIONS requests
app.options('*', cors());

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting - More permissive for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 for dev, 100 for production
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug logging for file requests
app.use('/uploads', (req, res, next) => {
  console.log(`📁 File request: ${req.method} ${req.url}`);
  console.log(`📂 Full path: ${path.join(__dirname, 'src', 'uploads', req.url)}`);
  next();
});

// Static file serving for uploads - serve from src/uploads where files are actually stored
app.use('/uploads', express.static(path.join(__dirname, 'src', 'uploads'), {
  setHeaders: (res, filePath) => {
    console.log(`✅ Serving file: ${filePath}`);
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/user', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Scholarship API is running!',
    timestamp: new Date().toISOString()
  });
});

// 404 handler - only for API routes, not static files
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error handler middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 API Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Network Access: http://10.185.173.7:${PORT}/api/health`);
});

module.exports = app;