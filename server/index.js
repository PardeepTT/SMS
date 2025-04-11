const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const { setupAuth } = require('./auth');
const { registerRoutes } = require('./routes');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 8000;

// Security middleware
app.use(helmet());

// Enable CORS with appropriate settings
app.use(cors({
  origin: ['http://localhost:5000', 'http://localhost:19006', 'exp://localhost:19000'],
  credentials: true
}));

// Request parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging middleware
app.use(morgan('dev'));

// Session configuration
app.use(session({
  genid: () => uuidv4(),
  secret: process.env.SESSION_SECRET || 'school_connect_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Set up authentication
setupAuth(app);

// Register API routes
const httpServer = registerRoutes(app);

// Basic error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Server Error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// Catch-all route for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Not Found', message: 'The requested resource does not exist' });
});

// Start the server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
});

// Handle process termination
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
