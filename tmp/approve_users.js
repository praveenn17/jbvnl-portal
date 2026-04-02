const mongoose = require('mongoose');

async function approveAll() {
  try {
    await mongoose.connect('mongodb://localhost:27017/jbvnl_portal');
    const result = await mongoose.connection.db.collection('users').updateMany(
      { status: 'pending' },
      { $set: { status: 'approved' } }
    );
    console.log(`Success: ${result.modifiedCount} users approved.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

approveAll();
