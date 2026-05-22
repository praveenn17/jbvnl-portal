const mongoose = require('mongoose');
const dotenv = require('dotenv');
const dns = require('node:dns');
const Bill = require('./models/Bill');
const User = require('./models/User');

dotenv.config();
dns.setServers(['8.8.8.8', '8.8.4.4']);

const seedBills = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/jbvnl_portal', {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('MongoDB Connected for seeding bills');

    // Find all active consumer users
    const consumers = await User.find({ role: 'consumer', status: 'approved' });

    if (consumers.length === 0) {
      console.log('No approved consumers found. Please register and approve a consumer first.');
      process.exit(0);
    }

    let totalCreated = 0;

    for (const consumer of consumers) {
      if (!consumer.consumerNumber) continue;

      // Check if bills already exist for this consumer to avoid duplicates
      const existingBillsCount = await Bill.countDocuments({ consumerNumber: consumer.consumerNumber });
      if (existingBillsCount >= 6) {
        console.log(`6 or more bills already exist for consumer ${consumer.consumerNumber}. Skipping.`);
        continue;
      } else if (existingBillsCount > 0 && existingBillsCount < 6) {
        // Clear existing to regenerate the exact 6 months
        await Bill.deleteMany({ consumerNumber: consumer.consumerNumber });
      }

      // Generate the exact 6 months of historical demo bills (Oct 2023 - Mar 2024)
      const baseId = Date.now().toString().slice(-6);
      const bills = [
        {
          consumerNumber: consumer.consumerNumber,
          billNumber: `BILL-${baseId}-10`,
          billingPeriod: 'October 2023',
          dueDate: new Date('2023-11-15'),
          amount: 1850,
          status: 'paid',
          units: 185,
          createdAt: new Date('2023-11-01')
        },
        {
          consumerNumber: consumer.consumerNumber,
          billNumber: `BILL-${baseId}-11`,
          billingPeriod: 'November 2023',
          dueDate: new Date('2023-12-15'),
          amount: 2200,
          status: 'paid',
          units: 220,
          createdAt: new Date('2023-12-01')
        },
        {
          consumerNumber: consumer.consumerNumber,
          billNumber: `BILL-${baseId}-12`,
          billingPeriod: 'December 2023',
          dueDate: new Date('2024-01-15'),
          amount: 2800,
          status: 'paid',
          units: 280,
          createdAt: new Date('2024-01-01')
        },
        {
          consumerNumber: consumer.consumerNumber,
          billNumber: `BILL-${baseId}-01`,
          billingPeriod: 'January 2024',
          dueDate: new Date('2024-02-15'),
          amount: 1950,
          status: 'paid',
          units: 195,
          createdAt: new Date('2024-02-01')
        },
        {
          consumerNumber: consumer.consumerNumber,
          billNumber: `BILL-${baseId}-02`,
          billingPeriod: 'February 2024',
          dueDate: new Date('2024-03-15'),
          amount: 1890,
          status: 'paid',
          units: 189,
          createdAt: new Date('2024-03-01')
        },
        {
          consumerNumber: consumer.consumerNumber,
          billNumber: `BILL-${baseId}-03`,
          billingPeriod: 'March 2024',
          dueDate: new Date('2024-04-15'),
          amount: 2450,
          status: 'pending',
          units: 245,
          createdAt: new Date('2024-04-01')
        },
      ];

      await Bill.insertMany(bills);
      console.log(`Seeded 6 monthly bills (Oct 2023-Mar 2024) for consumer ${consumer.consumerNumber}`);
      totalCreated += 6;
    }

    console.log(`Finished seeding. Total bills created: ${totalCreated}`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding bills:', error);
    process.exit(1);
  }
};

seedBills();
