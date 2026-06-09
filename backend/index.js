require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const connectDB = require('./config/db');
const { scheduleBillGeneration } = require('./utils/billGenerator');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url} ${res.statusCode} ${Date.now() - start}ms`);
  });
  next();
});

// Routes
app.use('/api/auth',             require('./routes/authRoutes'));
app.use('/api/bills',            require('./routes/billRoutes'));
app.use('/api/meters',           require('./routes/meterRoutes'));
app.use('/api/tariff',           require('./routes/tariffRoutes'));
app.use('/api/payments',         require('./routes/paymentRoutes'));
app.use('/api/complaints',       require('./routes/complaintRoutes'));
app.use('/api/service-requests', require('./routes/serviceRequestRoutes'));
app.use('/api/stats',            require('./routes/statsRoutes'));
app.use('/api/audit-logs',       require('./routes/auditRoutes'));
app.use('/api/notifications',    require('./routes/notificationRoutes'));
app.use('/api/settings',         require('./routes/settingsRoutes'));
app.use('/api/messages',         require('./routes/messageRoutes'));

app.get('/api/status', (req, res) => {
  res.json({ status: 'online', message: 'JBVNL API is running', environment: process.env.NODE_ENV });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[SERVER ERROR]', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    scheduleBillGeneration();
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('[STARTUP ERROR]', error.message);
  }
};

if (!process.env.VERCEL) {
  startServer();
}

module.exports = app;