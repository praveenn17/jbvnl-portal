require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const AdminSettings = require('./models/AdminSettings');

const seedAdminSettings = async () => {
  try {
    await connectDB();
    
    // Ensure only one settings document exists
    const existing = await AdminSettings.findOne();
    if (existing) {
      console.log('Settings already initialized.');
      process.exit();
    }

    const defaultSettings = new AdminSettings({
      autoApprovalThreshold: 5,
      emailNotifications: { registration: true, complaints: true, billing: false, summary: true },
      smsAlerts: { escalation: true, payment: false, outage: true },
      securityLevel: 'standard',
      notificationPrefs: { email: true, sms: true, push: false, weeklyReport: true },
      securitySettings: { passwordPolicy: true, otpVerification: true, adminProtection: true, sessionTimeout: 30 },
      backupSettings: { schedule: 'Daily 2:00 AM', lastBackupAt: new Date(), status: 'Healthy', frequency: 'daily' }
    });

    await defaultSettings.save();
    console.log('Successfully seeded default AdminSettings.');
    process.exit();
  } catch (error) {
    console.error('Error seeding admin settings:', error);
    process.exit(1);
  }
};

seedAdminSettings();
