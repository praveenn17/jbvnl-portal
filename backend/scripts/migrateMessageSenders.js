require('dotenv').config();
const mongoose = require('mongoose');

// DNS fix for node
if (!process.env.VERCEL) {
  const dns = require('node:dns');
  dns.setServers(['8.8.8.8', '8.8.4.4']);
}

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const db = mongoose.connection.db;
    const collection = db.collection('conversationmessages');

    // For every ConversationMessage where sender is missing/null but senderId exists,
    // set sender = senderId
    const result = await collection.updateMany(
      { sender: { $exists: false }, senderId: { $exists: true } },
      [{ $set: { sender: "$senderId" } }]
    );

    console.log(`Matched ${result.matchedCount} documents.`);
    console.log(`Modified ${result.modifiedCount} documents.`);

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
