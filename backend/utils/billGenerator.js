const cron   = require('node-cron');
const User   = require('../models/User');
const Bill   = require('../models/Bill');
const Meter  = require('../models/Meter');
const Tariff = require('../models/Tariff');
const { logAudit } = require('./auditLogger');
const { sendBillGeneratedEmail } = require('./emailService');

// ── Default tariff (fallback if no Tariff document in DB) ─────────────────
const DEFAULT_TARIFF = {
  domestic:   { ratePerUnit: 6.5,  fixedCharge: 80,  taxRate: 5 },
  commercial: { ratePerUnit: 9.0,  fixedCharge: 150, taxRate: 5 },
  industrial: { ratePerUnit: 7.5,  fixedCharge: 250, taxRate: 5 },
};

// ── Simulated reading fallback ─────────────────────────────────────────────
const simulateUnits = (consumerNumber, month, year) => {
  const seed = consumerNumber.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return Math.round(200 + ((seed + month * 37 + year) % 220));
};

// ── Get or auto-create a simulated meter ──────────────────────────────────
const getOrCreateMeter = async (consumer) => {
  let meter = await Meter.findOne({ consumerNumber: consumer.consumerNumber });
  if (meter) return meter;

  // Auto-create simulated meter
  const meterNumber = `SIM-${consumer.consumerNumber}-${Date.now()}`;
  meter = await Meter.create({
    meterNumber,
    consumerNumber: consumer.consumerNumber,
    meterType:       'domestic',
    previousReading: 0,
    currentReading:  0,
    status:          'simulated',
    isSimulated:     true,
  });

  console.warn(`[BILL-GEN] ⚠ No meter for ${consumer.consumerNumber} — auto-created simulated meter ${meterNumber}`);

  logAudit({
    action: 'METER_AUTO_CREATED',
    message: `Simulated meter ${meterNumber} auto-created for ${consumer.consumerNumber}`,
    actor: null, actorName: 'System', actorEmail: 'system@jbvnl.gov.in', actorRole: 'system',
    targetType: 'meter', targetId: meter._id, targetLabel: meterNumber,
    metadata: { consumerNumber: consumer.consumerNumber },
    severity: 'warning',
  });

  return meter;
};

// ── Core bill generation logic ─────────────────────────────────────────────
const generateMonthlyBills = async () => {
  try {
    const now   = new Date();
    const month = now.getMonth();   // 0-indexed
    const year  = now.getFullYear();

    const billingPeriod = now.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
    const dueDate       = new Date(year, month + 1, 15); // 15th of next month

    // Fetch active tariff (or use default)
    const tariffDoc = await Tariff.findOne({ isActive: true });

    // Fetch all approved consumers (exclude OTP placeholders)
    const consumers = await User.find({
      role: 'consumer',
      status: 'approved',
      name: { $ne: '__otp_pending__' },
    });

    console.log(`[BILL-GEN] Generating bills for ${consumers.length} consumers — ${billingPeriod}`);

    let generated = 0, skipped = 0, simulated = 0;

    for (const consumer of consumers) {
      if (!consumer.consumerNumber) continue;

      // Skip if bill already exists for this period
      const exists = await Bill.findOne({ consumerNumber: consumer.consumerNumber, billingPeriod });
      if (exists) { skipped++; continue; }

      // Get or create meter
      const meter    = await getOrCreateMeter(consumer);
      const meterType = meter.meterType || 'domestic';

      // ── Calculate units consumed ──────────────────────────────────────────
      let unitsConsumed;
      let prevReading = meter.previousReading ?? 0;
      let currReading = meter.currentReading  ?? 0;

      if (meter.isSimulated || currReading <= prevReading) {
        // Simulate a plausible reading increase
        unitsConsumed = simulateUnits(consumer.consumerNumber, month, year);
        currReading   = prevReading + unitsConsumed;
        simulated++;
      } else {
        unitsConsumed = currReading - prevReading;
      }

      // ── Apply tariff ──────────────────────────────────────────────────────
      const tariffRates = tariffDoc
        ? tariffDoc[meterType] || tariffDoc.domestic
        : DEFAULT_TARIFF[meterType] || DEFAULT_TARIFF.domestic;

      const { ratePerUnit, fixedCharge, taxRate } = tariffRates;
      const energyCharge = Math.round(unitsConsumed * ratePerUnit);
      const tax          = Math.round(energyCharge * taxRate / 100);
      const amount       = energyCharge + fixedCharge + tax;

      const billNumber = `JBVNL-${consumer.consumerNumber}-${String(month + 1).padStart(2, '0')}${year}`;

      const bill = await Bill.create({
        consumerNumber:  consumer.consumerNumber,
        billNumber,
        billingPeriod,
        dueDate,
        amount,
        units:           unitsConsumed,
        meterNumber:     meter.meterNumber,
        meterType,
        previousReading: prevReading,
        currentReading:  currReading,
        unitsConsumed,
        ratePerUnit,
        fixedCharge,
        energyCharge,
        taxRate,
        tax,
        status: 'pending',
      });

      if (consumer.email) {
        sendBillGeneratedEmail(
          consumer.email,
          consumer.name,
          bill.billNumber,
          bill.billingPeriod,
          bill.amount,
          bill.dueDate
        ).catch(err => console.error('[EMAIL] Bill notification failed:', err.message));
      }

      // ── Advance meter readings ────────────────────────────────────────────
      await Meter.findByIdAndUpdate(meter._id, {
        previousReading: currReading,
        lastUpdated:     new Date(),
      });

      generated++;

      logAudit({
        action: 'BILL_AUTO_GENERATED',
        message: `Auto-generated bill ${billNumber} for ${consumer.consumerNumber}`,
        actor: null, actorName: 'System', actorEmail: 'system@jbvnl.gov.in', actorRole: 'system',
        targetType: 'bill', targetId: bill._id, targetLabel: billNumber,
        metadata: { amount, unitsConsumed, billingPeriod, meterType, ratePerUnit },
        severity: 'info',
      });
    }

    console.log(`[BILL-GEN] Done — Generated: ${generated}, Skipped: ${skipped}, Simulated readings: ${simulated}`);
    return { generated, skipped, simulated };
  } catch (error) {
    console.error('[BILL-GEN ERROR]', error.message);
    throw error;
  }
};

// ── Schedule cron jobs ─────────────────────────────────────────────────────
const scheduleBillGeneration = () => {
  // Generate bills — 1st of every month at 00:00 IST
  cron.schedule('0 0 1 * *', async () => {
    console.log('[BILL-GEN] Cron triggered: monthly bill generation...');
    await generateMonthlyBills();
  }, { timezone: 'Asia/Kolkata' });

  // Mark overdue — daily at 01:00 IST
  cron.schedule('0 1 * * *', async () => {
    const now    = new Date();
    const result = await Bill.updateMany(
      { status: 'pending', dueDate: { $lt: now } },
      { $set: { status: 'overdue' } }
    );
    if (result.modifiedCount > 0) {
      console.log(`[BILL-GEN] Overdue: ${result.modifiedCount} bills marked overdue`);
    }
  }, { timezone: 'Asia/Kolkata' });

  console.log('[BILL-GEN] Crons registered: bill-gen (1st/month 00:00) + overdue (daily 01:00)');
};

module.exports = { scheduleBillGeneration, generateMonthlyBills };
