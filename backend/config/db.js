const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Vercel serverless optimizations and faster timeouts
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jbvnl_portal', {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Don't kill the Vercel process on connection fail, let it throw 500s properly
    // process.exit(1); 
  }
};

module.exports = connectDB;
