require('dotenv').config();
const mongoose = require('mongoose');
const AuditLog = require('./models/AuditLog');
const connectDB = require('./config/db');

const seedAuditLogs = async () => {
  try {
    await connectDB();

    console.log('Clearing existing audit logs...');
    await AuditLog.deleteMany({});

    console.log('Seeding demo audit logs...');

    const demoLogs = [
      {
        action: 'USER_APPROVED',
        message: 'Admin approved manager account',
        actorName: 'Admin',
        actorEmail: 'admin@jbvnl.in',
        actorRole: 'admin',
        targetType: 'user',
        targetLabel: 'manager@test.com',
        severity: 'info',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      {
        action: 'COMPLAINT_ASSIGNED',
        message: 'Admin assigned complaint to Emergency Response Team',
        actorName: 'Admin',
        actorEmail: 'admin@jbvnl.in',
        actorRole: 'admin',
        targetType: 'complaint',
        targetLabel: 'Power Outage in Sector 4',
        metadata: { assignedTeam: 'Emergency Response Team' },
        severity: 'info',
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      },
      {
        action: 'COMPLAINT_STATUS_UPDATED',
        message: 'Manager updated complaint to In Progress',
        actorName: 'John Doe',
        actorEmail: 'manager@jbvnl.in',
        actorRole: 'manager',
        targetType: 'complaint',
        targetLabel: 'Power Outage in Sector 4',
        metadata: { status: 'in_progress' },
        severity: 'info',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        action: 'COMPLAINT_STATUS_UPDATED',
        message: 'Manager resolved a complaint',
        actorName: 'John Doe',
        actorEmail: 'manager@jbvnl.in',
        actorRole: 'manager',
        targetType: 'complaint',
        targetLabel: 'Power Outage in Sector 4',
        metadata: { status: 'resolved' },
        severity: 'info',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        action: 'BILL_DOWNLOADED',
        message: 'Consumer downloaded May electricity bill',
        actorName: 'Praveen',
        actorEmail: 'consumer@test.com',
        actorRole: 'consumer',
        targetType: 'bill',
        targetLabel: 'BILL-2026-05',
        severity: 'info',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        action: 'SECURITY_SETTING_CHANGED',
        message: 'Admin changed security level to High',
        actorName: 'Admin',
        actorEmail: 'admin@jbvnl.in',
        actorRole: 'admin',
        targetType: 'setting',
        targetLabel: 'Security Level',
        metadata: { newLevel: 'high' },
        severity: 'warning',
        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) // 12 hours ago
      },
      {
        action: 'MANUAL_BACKUP_TRIGGERED',
        message: 'Admin ran manual backup',
        actorName: 'Admin',
        actorEmail: 'admin@jbvnl.in',
        actorRole: 'admin',
        targetType: 'system',
        targetLabel: 'Database',
        severity: 'info',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
      },
      {
        action: 'LOGIN_SUCCESS',
        message: 'Admin logged in successfully',
        actorName: 'Admin',
        actorEmail: 'admin@jbvnl.in',
        actorRole: 'admin',
        targetType: 'auth',
        severity: 'info',
        createdAt: new Date()
      }
    ];

    await AuditLog.insertMany(demoLogs);
    console.log('Successfully seeded audit logs!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding audit logs:', error);
    process.exit(1);
  }
};

seedAuditLogs();
