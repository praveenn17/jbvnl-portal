require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Remove fs to prevent Vercel crashes (Vercel has read-only filesystem)

const app = express();

// Avoid background connections breaking on Vercel Serverless
// We use a middleware to ensure Database is connected BEFORE routing
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Vercel DB Connection Error:", err);
    res.status(500).json({ message: "Database connection failed", error: err.message });
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Request Logger for Debugging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = `${new Date().toISOString()} - ${req.method} ${req.url} ${res.statusCode} ${duration}ms\n`;
    console.log(log);
  });
  next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/bills', require('./routes/billRoutes'));
app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));

app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'online', 
    message: 'JBVNL API is running',
    environment: process.env.NODE_ENV 
  });
});

// Define Ports
const PORT = process.env.PORT || 5000;

// Export for Vercel Serverless Functions
module.exports = app;

  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
