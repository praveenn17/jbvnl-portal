const mongoose = require('mongoose');
const ConversationMessage = require('./models/ConversationMessage');
const Conversation = require('./models/Conversation');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jbvnl', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(async () => {
  const msgs = await ConversationMessage.find().populate('senderId');
  console.log("Messages in DB:");
  msgs.forEach(m => {
    console.log(`Msg ID: ${m._id}`);
    console.log(`- senderName in DB: ${m.senderName}`);
    console.log(`- senderRole in DB: ${m.senderRole}`);
    console.log(`- Actual User Name: ${m.senderId ? m.senderId.name : 'Unknown'}`);
    console.log(`- Actual User Role: ${m.senderId ? m.senderId.role : 'Unknown'}`);
    console.log('---');
  });
  process.exit(0);
});
