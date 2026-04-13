/**
 * JBVNL Admin Seed Script
 * -----------------------
 * Creates the default admin account in MongoDB.
 * Run ONCE from the backend directory:  node seedAdmin.js
 *
 * Default credentials (change password after first login):
 *   Email   : admin@jbvnl.in
 *   Password: Admin@1234
 *   Role    : admin
 */

require('dotenv').config();
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const mongoose = require('mongoose');
const User = require('./models/User');

const ADMIN_EMAIL    = 'admin@jbvnl.in';
const ADMIN_PASSWORD = 'Admin@1234';
const ADMIN_NAME     = 'JBVNL Admin';

async function seed() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || 'mongodb://localhost:27017/jbvnl_portal'
    );
    console.log('[SEED] Connected to MongoDB');

    const existing = await User.findOne({ email: ADMIN_EMAIL });

    if (existing) {
      console.log(`[SEED] Admin already exists: ${ADMIN_EMAIL}`);
      console.log(`[SEED] Role: ${existing.role} | Status: ${existing.status}`);
      console.log('[SEED] No changes made. Exiting.');
      process.exit(0);
    }

    // User model hashes password automatically via pre-save hook
    const admin = await User.create({
      name  : ADMIN_NAME,
      email : ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role  : 'admin',
      status: 'approved',
    });

    console.log('');
    console.log('╔══════════════════════════════════════════╗');
    console.log('║        ADMIN USER SEEDED SUCCESSFULLY    ║');
    console.log('╠══════════════════════════════════════════╣');
    console.log(`║  Email   : ${ADMIN_EMAIL}          ║`);
    console.log(`║  Password: ${ADMIN_PASSWORD}               ║`);
    console.log('║  Role    : admin                         ║');
    console.log('║  Status  : approved                      ║');
    console.log('╠══════════════════════════════════════════╣');
    console.log('║  ⚠ Change password after first login!   ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log('');

    process.exit(0);
  } catch (err) {
    console.error('[SEED ERROR]', err.message);
    process.exit(1);
  }
}

seed();
