if (!process.env.VERCEL) {
  const dns = require('node:dns');
  dns.setServers(['8.8.8.8', '8.8.4.4']);
}
const mongoose = require('mongoose');

let cachedConn = null;

const connectDB = async () => {
  if (cachedConn) {
    return cachedConn;
  }
  try {
    // Vercel serverless optimizations and faster timeouts
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jbvnl_portal', {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    cachedConn = conn;
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Let errors bubble up instead of silent freezing
    throw error;
  }
};

module.exports = connectDB;
