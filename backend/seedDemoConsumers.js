const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const demoConsumers = [
  { name: 'Ramesh Kumar', email: 'ramesh.k@example.com', phone: '9876543201', consumerNumber: 'JBVNL1001', address: '12 Kanke Road', district: 'Ranchi' },
  { name: 'Sita Devi', email: 'sita.d@example.com', phone: '9876543202', consumerNumber: 'JBVNL1002', address: '45 Bistupur', district: 'Jamshedpur' },
  { name: 'Amit Singh', email: 'amit.s@example.com', phone: '9876543203', consumerNumber: 'JBVNL1003', address: '88 Bank More', district: 'Dhanbad' },
  { name: 'Pooja Sharma', email: 'pooja.s@example.com', phone: '9876543204', consumerNumber: 'JBVNL1004', address: 'Sector 4', district: 'Bokaro' },
  { name: 'Vikash Yadav', email: 'vikash.y@example.com', phone: '9876543205', consumerNumber: 'JBVNL1005', address: '22 Main Road', district: 'Hazaribagh' },
  { name: 'Neha Gupta', email: 'neha.g@example.com', phone: '9876543206', consumerNumber: 'JBVNL1006', address: 'Near Tower Chowk', district: 'Deoghar' },
  { name: 'Rajesh Verma', email: 'rajesh.v@example.com', phone: '9876543207', consumerNumber: 'JBVNL1007', address: 'Barganda', district: 'Giridih' },
  { name: 'Sunita Mishra', email: 'sunita.m@example.com', phone: '9876543208', consumerNumber: 'JBVNL1008', address: 'Chitarpur', district: 'Ramgarh' },
  { name: 'Arun Tiwary', email: 'arun.t@example.com', phone: '9876543209', consumerNumber: 'JBVNL1009', address: 'Harmu Housing Colony', district: 'Ranchi' },
  { name: 'Kavita Kumari', email: 'kavita.k@example.com', phone: '9876543210', consumerNumber: 'JBVNL1010', address: 'Sakchi', district: 'Jamshedpur' },
  { name: 'Sanjay Paswan', email: 'sanjay.p@example.com', phone: '9876543211', consumerNumber: 'JBVNL1011', address: 'Hirapur', district: 'Dhanbad' },
  { name: 'Meena Oraon', email: 'meena.o@example.com', phone: '9876543212', consumerNumber: 'JBVNL1012', address: 'City Centre', district: 'Bokaro' },
  { name: 'Deepak Munda', email: 'deepak.m@example.com', phone: '9876543213', consumerNumber: 'JBVNL1013', address: 'Boddom Bazar', district: 'Hazaribagh' },
  { name: 'Anita Soren', email: 'anita.s@example.com', phone: '9876543214', consumerNumber: 'JBVNL1014', address: 'Baidyanath Dham', district: 'Deoghar' },
  { name: 'Manoj Mahato', email: 'manoj.m@example.com', phone: '9876543215', consumerNumber: 'JBVNL1015', address: 'Makarpur', district: 'Giridih' },
  { name: 'Rekha Sinha', email: 'rekha.s@example.com', phone: '9876543216', consumerNumber: 'JBVNL1016', address: 'Gola Road', district: 'Ramgarh' },
  { name: 'Suraj Prakash', email: 'suraj.p@example.com', phone: '9876543217', consumerNumber: 'JBVNL1017', address: 'Doranda', district: 'Ranchi' },
  { name: 'Kiran Bedia', email: 'kiran.b@example.com', phone: '9876543218', consumerNumber: 'JBVNL1018', address: 'Telco Colony', district: 'Jamshedpur' },
  { name: 'Anil Pandey', email: 'anil.p@example.com', phone: '9876543219', consumerNumber: 'JBVNL1019', address: 'Saraidhela', district: 'Dhanbad' },
  { name: 'Priya Ranjan', email: 'priya.r@example.com', phone: '9876543220', consumerNumber: 'JBVNL1020', address: 'Chas', district: 'Bokaro' }
];

const seedConsumers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Demo@123', salt);

    let addedCount = 0;

    for (const c of demoConsumers) {
      // Check if user already exists
      const existingUser = await User.findOne({ $or: [{ email: c.email }, { consumerNumber: c.consumerNumber }] });
      
      if (!existingUser) {
        await User.create({
          name: c.name,
          email: c.email,
          password: hashedPassword,
          role: 'consumer',
          phone: c.phone,
          consumerNumber: c.consumerNumber,
          address: `${c.address}, ${c.district}, Jharkhand`,
          status: 'approved',
          isEmailVerified: true
        });
        addedCount++;
      }
    }

    console.log(`Successfully seeded ${addedCount} new Jharkhand demo consumers.`);
    console.log(`Password for all demo consumers is: Demo@123`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding consumers:', error);
    process.exit(1);
  }
};

seedConsumers();
