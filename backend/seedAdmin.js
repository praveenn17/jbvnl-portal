/**
 * JBVNL Admin Seed Script
 * -----------------------
 * Creates (or repairs) the default admin account in MongoDB.
 *
 * Usage:
 *   npm run seed:admin
 *   — or —
 *   node seedAdmin.js
 *
 * Credentials are read from environment variables (see .env.example).
 * The password is NEVER printed in production.
 */

'use strict';

require('dotenv').config();

// ── DNS fix for local/non-Vercel environments ─────────────────────────────────
if (!process.env.VERCEL) {
  const dns = require('node:dns');
  dns.setServers(['8.8.8.8', '8.8.4.4']);
}

const mongoose = require('mongoose');
const User = require('./models/User');

// ── Step 1: Validate required environment variables ───────────────────────────
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('');
  console.error('╔══════════════════════════════════════════════════════════╗');
  console.error('║  [SEED ERROR] MONGO_URI is not set in your .env file.   ║');
  console.error('║                                                          ║');
  console.error('║  Please add it before running this script:              ║');
  console.error('║    MONGO_URI=mongodb+srv://<user>:<pass>@<host>/<db>    ║');
  console.error('║                                                          ║');
  console.error('║  See .env.example for all required variables.           ║');
  console.error('╚══════════════════════════════════════════════════════════╝');
  console.error('');
  process.exit(1);
}

// ── Step 2: Read credentials with safe fallbacks ──────────────────────────────
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@jbvnl.in';
const ADMIN_NAME = process.env.ADMIN_NAME || 'JBVNL Admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@1234';

// Warn loudly if the fallback (default) password is being used
const usingFallbackPassword = !process.env.ADMIN_PASSWORD;
if (usingFallbackPassword) {
  console.warn('');
  console.warn('⚠  WARNING: ADMIN_PASSWORD is not set in your .env file.');
  console.warn('   Using default fallback password: Admin@1234');
  console.warn('   This is acceptable for local development, but MUST be');
  console.warn('   changed before deploying to production.');
  console.warn('');
}

// ── Main seed function ────────────────────────────────────────────────────────
async function seed() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('[SEED] Connected to MongoDB');

    const existing = await User.findOne({ email: ADMIN_EMAIL });

    if (existing) {
      // ── Case A: Stale OTP-pending placeholder (name is the sentinel value) ──
      // This happens when someone tried to register with the admin email before
      // the admin was seeded. We upgrade it to a proper admin record.
      // NOTE: We do NOT reset the password here if the record already had one
      //       set (i.e. it was a real partial registration, not just a placeholder).
      if (existing.name === '__otp_pending__') {
        console.log('[SEED] Found stale OTP-pending record — upgrading to admin...');
        existing.name = ADMIN_NAME;
        // Only set the password if none was stored yet
        // (the pre-save hook will hash it if we touch it)
        if (!existing.password || existing.password === '__otp_pending__') {
          existing.password = ADMIN_PASSWORD;
        }
        existing.role = 'admin';
        existing.status = 'approved';
        existing.isEmailVerified = true;
        existing.emailOtpHash = null;
        existing.emailOtpExpires = null;
        existing.emailOtpAttempts = 0;
        await existing.save();
        console.log('[SEED] Admin record upgraded successfully.');
        console.log(`[SEED]   Email   : ${existing.email}`);
        console.log(`[SEED]   Role    : ${existing.role}`);
        console.log(`[SEED]   Status  : ${existing.status}`);
        console.log(`[SEED]   Verified: ${existing.isEmailVerified}`);

      } else {
        // ── Case B: Real admin record exists — patch any wrong/missing fields ──
        // Password is intentionally NOT touched here.
        const patches = [];

        if (existing.role !== 'admin') {
          console.log(`[SEED]   role: "${existing.role}" → "admin"`);
          existing.role = 'admin';
          patches.push('role');
        }
        if (existing.status !== 'approved') {
          console.log(`[SEED]   status: "${existing.status}" → "approved"`);
          existing.status = 'approved';
          patches.push('status');
        }
        if (!existing.isEmailVerified) {
          console.log(`[SEED]   isEmailVerified: ${existing.isEmailVerified} → true`);
          existing.isEmailVerified = true;
          patches.push('isEmailVerified');
        }

        if (patches.length > 0) {
          // Use { validateModifiedOnly: true } so untouched fields
          // (especially the hashed password) don't re-run validation.
          await existing.save({ validateModifiedOnly: true });
          console.log(`[SEED] Admin patched (${patches.join(', ')}) — saved successfully.`);
        } else {
          console.log('[SEED] Admin already exists and is properly configured.');
          console.log(`[SEED]   Email   : ${existing.email}`);
          console.log(`[SEED]   Role    : ${existing.role}`);
          console.log(`[SEED]   Status  : ${existing.status}`);
          console.log(`[SEED]   Verified: ${existing.isEmailVerified}`);
          console.log('[SEED] No changes made. Exiting.');
        }
      }

      await mongoose.disconnect();
      process.exit(0);
    }

    // ── Create new admin user ─────────────────────────────────────────────────
    // The User model's pre-save hook automatically hashes the password.
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
      status: 'approved',
      isEmailVerified: true, // Admins are seeded directly — no OTP needed
    });

    // ── Success banner ────────────────────────────────────────────────────────
    console.log('');
    console.log('╔══════════════════════════════════════════╗');
    console.log('║      ADMIN USER SEEDED SUCCESSFULLY      ║');
    console.log('╠══════════════════════════════════════════╣');
    console.log(`║  Email   : ${ADMIN_EMAIL.padEnd(30)}║`);
    console.log(`║  Name    : ${ADMIN_NAME.padEnd(30)}║`);

    // Only print the password in non-production environments
    if (!IS_PRODUCTION) {
      console.log(`║  Password: ${ADMIN_PASSWORD.padEnd(30)}║`);
    } else {
      console.log('║  Password: [hidden in production]        ║');
    }

    console.log('║  Role    : admin                         ║');
    console.log('║  Status  : approved                      ║');
    console.log('║  Verified: true                          ║');
    console.log('╠══════════════════════════════════════════╣');
    console.log('║  ⚠  Change the password after first     ║');
    console.log('║     login!                               ║');
    console.log('╚══════════════════════════════════════════╝');
    console.log('');

    await mongoose.disconnect();
    process.exit(0);

  } catch (err) {
    console.error('');
    console.error('[SEED ERROR]', err.message);
    console.error('');
    process.exit(1);
  }
}

seed();
