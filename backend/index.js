require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const fs = require('fs');

// Startup Log
fs.writeFileSync('backend_start.log', `Backend started at ${new Date().toISOString()}\n`);

// Connect to Database
connectDB();

const app = express();

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
    fs.appendFileSync('backend_requests.log', log);
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

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
