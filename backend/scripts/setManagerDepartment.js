require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const result = await User.updateMany(
    { 
      role: 'manager', 
      $or: [{ department: null }, { department: '' }, { department: { $exists: false } }]
    },
    { $set: { department: 'Billing Team' } }
  );

  console.log(`Updated ${result.modifiedCount} manager(s) with department: Billing Team`);
  await mongoose.disconnect();
  console.log('Done');
}

run().catch(console.error);
