const mongoose = require('mongoose');

async function fixEmails() {
  try {
    await mongoose.connect('mongodb://localhost:27017/jbvnl_portal');
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({}).toArray();
    
    let count = 0;
    for (const user of users) {
      const lowerEmail = user.email.toLowerCase().trim();
      if (user.email !== lowerEmail) {
        await db.collection('users').updateOne(
          { _id: user._id },
          { $set: { email: lowerEmail } }
        );
        console.log(`Updated: ${user.email} -> ${lowerEmail}`);
        count++;
      }
    }
    
    console.log(`Finished. Updated ${count} users.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixEmails();
