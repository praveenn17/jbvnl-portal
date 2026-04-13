const mongoose = require('mongoose');

const uri2 = "mongodb://viveksingh_18:CL5moshJkUds5X0B@ac-ybc9fr9-shard-00-00.wszvmf7.mongodb.net:27017,ac-ybc9fr9-shard-00-01.wszvmf7.mongodb.net:27017,ac-ybc9fr9-shard-00-02.wszvmf7.mongodb.net:27017/jbvnl_portal?ssl=true&replicaSet=atlas-ybc9fr-shard-0&authSource=admin&retryWrites=true&w=majority";

async function test() {
  try {
    console.log("Testing Direct URI...");
    await mongoose.connect(uri2, { serverSelectionTimeoutMS: 5000 });
    console.log("Direct URI Success!!!!!");
    await mongoose.disconnect();
  } catch (e) {
    console.error("Direct URI Failed:", e.message);
  }
}

test();
