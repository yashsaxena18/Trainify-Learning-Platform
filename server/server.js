// server.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load .env variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Import route files
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

// Initialize Express app
const app = express();

// -------------------- CORS Setup --------------------
const allowedOrigins = [
  'http://localhost:5173',
  'https://trainify-learning-platform.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true); // allow Postman or mobile apps
    if (!allowedOrigins.includes(origin)) {
      return callback(new Error("CORS policy does not allow access from this origin"), false);
    }
    return callback(null, true);
  },
  credentials: true, // allow cookies
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","Accept"]
}));

// Handle preflight requests
app.options("*", cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (!allowedOrigins.includes(origin)) {
      return callback(new Error("CORS policy does not allow access from this origin"), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","Accept"]
}));

// -------------------- Middleware --------------------
app.use(express.json()); // parse JSON

// -------------------- Routes --------------------

// Health check
app.get('/api/test', (req, res) => {
  res.json({ success: true, message: 'Backend is working' });
});

// Auth
app.use('/api/auth', authRoutes);

// Users
app.use('/api/users', userRoutes);

// Courses
app.use('/api/courses', courseRoutes);

// Instructor
app.use('/api/instructor', instructorRoutes);

// Admin
app.use('/api/admin', adminRoutes);

// Progress
app.use('/api/progress', progressRoutes);

// Certificates
app.use('/api/certificate', certificateRoutes);

// Lectures
app.use('/api/lectures', lectureRoutes);

// Activity
app.use('/api/activity', activityRoutes);

// Payment
app.use("/api/payment", paymentRoutes);

// AI
app.use('/api/ai', aiRoutes);

// Notes
app.use('/api/notes', notesRoutes);

// Root
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Trainify API',
    docs: '/api/test'
  });
});

// -------------------- Start Server --------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
