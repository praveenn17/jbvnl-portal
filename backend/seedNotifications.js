require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Notification = require('./models/Notification');
const User = require('./models/User');

const seedNotifications = async () => {
  try {
    await connectDB();
    await Notification.deleteMany({}); // Clear existing notifications

    const admin = await User.findOne({ role: 'admin' });
    const manager = await User.findOne({ role: 'manager' });
    const consumer = await User.findOne({ role: 'consumer' });

    const seedData = [];

    // Admin Notifications
    if (admin) {
      seedData.push(
        {
          recipientRole: 'admin',
          title: 'System Maintenance',
          message: 'Scheduled downtime for server upgrade at 03:00 AM.',
          type: 'SYSTEM',
          priority: 'high',
          isRead: false
        },
        {
          recipient: admin._id,
          recipientRole: 'admin',
          title: 'New Manager Registration',
          message: 'Rahul Kumar (rahul@jbvnl.in) has registered and is pending approval.',
          type: 'USER_REGISTRATION',
          priority: 'normal',
          isRead: false
        }
      );
    }

    // Manager Notifications
    if (manager) {
      seedData.push(
        {
          recipient: manager._id,
          recipientRole: 'manager',
          title: 'Complaint Assigned',
          message: 'A new emergency power outage complaint (Sector 4) has been assigned to you.',
          type: 'COMPLAINT_ASSIGNED',
          priority: 'urgent',
          isRead: false
        },
        {
          recipientRole: 'manager',
          title: 'Policy Update',
          message: 'Please review the updated SLA compliance guidelines.',
          type: 'SYSTEM',
          priority: 'normal',
          isRead: true,
          readAt: Date.now()
        }
      );
    }

    // Consumer Notifications
    if (consumer) {
      seedData.push(
        {
          recipient: consumer._id,
          recipientRole: 'consumer',
          title: 'Bill Generated',
          message: 'Your electricity bill for the month of April has been generated.',
          type: 'BILL_UPDATED',
          priority: 'normal',
          isRead: false
        },
        {
          recipient: consumer._id,
          recipientRole: 'consumer',
          title: 'Complaint Status Updated',
          message: 'The status of your complaint (Meter Fault) is now in_progress.',
          type: 'COMPLAINT_STATUS_UPDATED',
          priority: 'normal',
          isRead: true,
          readAt: Date.now()
        }
      );
    }

    await Notification.insertMany(seedData);
    console.log(`Successfully seeded ${seedData.length} notifications.`);
    process.exit();
  } catch (error) {
    console.error('Error seeding notifications:', error);
    process.exit(1);
  }
};

seedNotifications();
