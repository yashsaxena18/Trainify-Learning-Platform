// server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load .env variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Route files
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const instructorRoutes = require('./routes/instructorRoutes');
const adminRoutes = require('./routes/adminRoutes'); 
const progressRoutes = require('./routes/progressRoutes');
const certificateRoutes = require('./routes/certificateRoutes');
const lectureRoutes = require('./routes/lectureRoutes');
const activityRoutes = require('./routes/activityRoutes');
const paymentRoutes = require('./routes/payment');
const aiRoutes = require('./routes/ai');
const notesRoutes = require('./routes/notes');

// App setup
const app = express();

// Allowed origins for CORS
const allowedOrigins = ['http://localhost:5173', 'https://trainify-learning-platform.vercel.app'];

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    if(!origin) return callback(null, true); // allow Postman, mobile apps
    if(!allowedOrigins.includes(origin)) {
      return callback(new Error("CORS policy does not allow access from this origin"), false);
    }
    return callback(null, true);
  },
  credentials: true, // allow cookies
  methods: ["GET","POST","PUT","DELETE","OPTIONS"], // allow these HTTP methods
  allowedHeaders: ["Content-Type","Authorization","Accept"] // allow these headers
}));

// Handle preflight requests for all routes
app.options("*", cors({
  origin: function(origin, callback) {
    if(!origin) return callback(null, true);
    if(!allowedOrigins.includes(origin)) {
      return callback(new Error("CORS policy does not allow access from this origin"), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","Accept"]
}));

// Middleware to parse JSON
app.use(express.json());

// Helper middleware for setting cookies in cross-domain
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  next();
});

// Health check route
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Backend is working' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/certificate', certificateRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/activity', activityRoutes);
app.use("/api/payment", paymentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notes', notesRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Trainify API',
    docs: '/api/test'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
