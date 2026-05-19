const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Complaint = require('./models/Complaint');

// Load env vars
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/jbvnl';

const demoComplaints = [
  {
    consumerNumber: 'JBVNL001',
    title: 'Power Outage for 3 Days',
    description: 'Complete power outage in the entire sector for 3 days. Multiple complaints from residents. Transformer suspected to be faulty. Emergency repair needed.',
    category: 'power_outage',
    status: 'assigned',
    priority: 'urgent',
    assignedTeam: 'Emergency Response Team',
    adminNotes: [{
      note: 'Field inspection scheduled immediately.',
      addedBy: 'System Admin',
      addedByRole: 'admin',
      createdAt: new Date()
    }],
    timeline: [
      {
        status: 'open',
        title: 'Complaint Registered',
        message: 'Consumer filed a new complaint',
        changedByRole: 'consumer',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        status: 'assigned',
        title: 'Assigned to Team',
        message: 'Assigned to Emergency Response Team',
        changedByRole: 'admin',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ],
    sla: {
      slaHours: 4,
      dueAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000),
      status: 'breached'
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  },
  {
    consumerNumber: 'JBVNL002',
    title: 'Overcharged Electricity Bill',
    description: 'Bill shows 40% higher charges than usual. Meter reading seems incorrect. Consumer requests re-verification of meter reading and bill recalculation.',
    category: 'billing',
    status: 'in_progress',
    priority: 'medium',
    assignedTeam: 'Billing Team',
    adminNotes: [],
    timeline: [
      {
        status: 'open',
        title: 'Complaint Registered',
        message: 'Consumer filed a new complaint',
        changedByRole: 'consumer',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        status: 'in_progress',
        title: 'Investigation Started',
        message: 'Checking meter logs',
        changedByRole: 'manager',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ],
    sla: {
      slaHours: 48,
      dueAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 48 * 60 * 60 * 1000),
      status: 'on_track'
    },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date()
  },
  {
    consumerNumber: 'JBVNL003',
    title: 'Meter Reading Not Updated',
    description: 'Digital meter display stopped updating 2 weeks ago. Meter appears frozen at the same reading. Consumer concerned about estimated billing.',
    category: 'meter',
    status: 'open',
    priority: 'medium',
    assignedTeam: '',
    adminNotes: [],
    timeline: [
      {
        status: 'open',
        title: 'Complaint Registered',
        message: 'Consumer filed a new complaint',
        changedByRole: 'consumer',
        createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000) // 10 hours ago
      }
    ],
    sla: {
      slaHours: 48,
      dueAt: new Date(Date.now() - 10 * 60 * 60 * 1000 + 48 * 60 * 60 * 1000),
      status: 'on_track'
    },
    createdAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
    updatedAt: new Date()
  },
  {
    consumerNumber: 'JBVNL004',
    title: 'Low Voltage in Evening Hours',
    description: 'Voltage drops significantly between 6 PM and 10 PM daily. Home appliances unable to operate. AC and refrigerator shutting down frequently.',
    category: 'technical',
    status: 'resolved',
    priority: 'high',
    assignedTeam: 'Field Inspection Team',
    adminNotes: [{
      note: 'Voltage logger installed. Transformer tap adjusted.',
      addedBy: 'Field Tech',
      addedByRole: 'manager',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
    }],
    timeline: [
      {
        status: 'open',
        title: 'Complaint Registered',
        message: 'Consumer filed a new complaint',
        changedByRole: 'consumer',
        createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000)
      },
      {
        status: 'resolved',
        title: 'Complaint Resolved',
        message: 'Transformer tap adjusted',
        changedByRole: 'manager',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
      }
    ],
    sla: {
      slaHours: 24,
      dueAt: new Date(Date.now() - 48 * 60 * 60 * 1000 + 24 * 60 * 60 * 1000),
      resolvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'completed'
    },
    resolvedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    updatedAt: new Date()
  }
];

const seedComplaints = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB Connected.');

    // Count existing complaints
    const count = await Complaint.countDocuments();
    if (count > 0) {
      console.log(`[SEED] ${count} complaints already exist. Skipping demo data insertion to avoid duplicates.`);
      process.exit(0);
    }

    console.log('[SEED] Inserting demo complaints...');
    await Complaint.insertMany(demoComplaints);
    console.log('[SEED] Demo complaints successfully inserted!');

    process.exit(0);
  } catch (error) {
    console.error('[SEED] Error:', error);
    process.exit(1);
  }
};

seedComplaints();
