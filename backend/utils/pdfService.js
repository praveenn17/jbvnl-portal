const PDFDocument = require('pdfkit');

/**
 * Generates a professional JBVNL electricity bill PDF.
 * Pipes the document directly to the Express response object.
 *
 * @param {Object} bill     - Mongoose Bill document
 * @param {Object} consumer - Mongoose User document (consumer)
 * @param {Object} res      - Express response object
 */
const generateBillPdf = (bill, consumer, res) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="JBVNL-Bill-${bill.billNumber}.pdf"`
  );
  doc.pipe(res);

  const BRAND_COLOR   = '#1e3a5f';  // JBVNL navy
  const ACCENT_COLOR  = '#2563eb';  // accent blue
  const LIGHT_BG      = '#f0f4ff';
  const PAGE_WIDTH    = doc.page.width - 100;  // left + right margin

  // ── Watermark ──────────────────────────────────────────────────────────────
  doc.save();
  doc.rotate(-45, { origin: [doc.page.width / 2, doc.page.height / 2] });
  doc.fontSize(80)
     .fillOpacity(0.05)
     .fillColor(BRAND_COLOR)
     .text('JBVNL', 0, doc.page.height / 2 - 40, {
       align: 'center',
       width: doc.page.width,
     });
  doc.restore();
  doc.fillOpacity(1);

  // ── Header ─────────────────────────────────────────────────────────────────
  doc.rect(50, 40, PAGE_WIDTH, 90).fill(BRAND_COLOR);

  doc.fillColor('white')
     .fontSize(22)
     .font('Helvetica-Bold')
     .text('JBVNL Smart Portal', 70, 55);

  doc.fontSize(10)
     .font('Helvetica')
     .text('Jharkhand Bijli Vitran Nigam Limited', 70, 82)
     .text('Government of Jharkhand, India', 70, 96)
     .text('CIN: U40100JH2013SGC002178  |  helpdesk@jbvnl.co.in', 70, 110);

  // Bill label (right side of header)
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('ELECTRICITY BILL', 0, 62, { align: 'right', width: PAGE_WIDTH + 50 });
  doc.fontSize(10)
     .font('Helvetica')
     .text(`Bill No: ${bill.billNumber}`, 0, 82, { align: 'right', width: PAGE_WIDTH + 50 })
     .text(`Period: ${bill.billingPeriod}`, 0, 96, { align: 'right', width: PAGE_WIDTH + 50 });

  doc.moveDown(5);

  // ── Status Badge ───────────────────────────────────────────────────────────
  const statusColors = { paid: '#16a34a', pending: '#d97706', overdue: '#dc2626' };
  const sColor = statusColors[bill.status] || '#6b7280';
  doc.rect(50, 140, PAGE_WIDTH, 28).fill(sColor);
  doc.fillColor('white').fontSize(11).font('Helvetica-Bold')
     .text(`Status: ${bill.status.toUpperCase()}  |  Due: ${new Date(bill.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`,
       60, 148);

  doc.moveDown(1.5);

  // ── Consumer + Bill Details (two columns) ─────────────────────────────────
  const col1X = 50, col2X = 310, rowY = 185;

  // Column headers
  doc.rect(50, rowY - 2, 250, 20).fill(LIGHT_BG);
  doc.rect(310, rowY - 2, PAGE_WIDTH - 260, 20).fill(LIGHT_BG);

  doc.fillColor(BRAND_COLOR).fontSize(10).font('Helvetica-Bold')
     .text('CONSUMER DETAILS', col1X + 4, rowY + 3)
     .text('BILL DETAILS', col2X + 4, rowY + 3);

  const detail = (x, y, label, value) => {
    doc.fillColor('#374151').fontSize(9).font('Helvetica-Bold').text(label, x, y);
    doc.fillColor('#111827').fontSize(9).font('Helvetica').text(value || '—', x + 110, y);
  };

  detail(col1X, rowY + 26, 'Consumer No.:', consumer.consumerNumber || '—');
  detail(col1X, rowY + 40, 'Name:', consumer.name || '—');
  detail(col1X, rowY + 54, 'Address:', (consumer.address || 'N/A').substring(0, 30));
  detail(col1X, rowY + 68, 'Phone:', consumer.phone || 'N/A');
  detail(col1X, rowY + 82, 'Email:', (consumer.email || 'N/A').substring(0, 28));

  detail(col2X, rowY + 26, 'Bill Number:', bill.billNumber);
  detail(col2X, rowY + 40, 'Billing Period:', bill.billingPeriod);
  detail(col2X, rowY + 54, 'Due Date:', new Date(bill.dueDate).toLocaleDateString('en-IN'));
  detail(col2X, rowY + 68, 'Meter No.:', bill.meterNumber || 'N/A');
  detail(col2X, rowY + 82, 'Meter Type:', bill.meterType || 'Domestic');

  doc.moveTo(50, rowY + 102).lineTo(50 + PAGE_WIDTH, rowY + 102).strokeColor('#e5e7eb').stroke();

  // ── Meter Readings ─────────────────────────────────────────────────────────
  const meterY = rowY + 112;
  doc.rect(50, meterY, PAGE_WIDTH, 18).fill(LIGHT_BG);
  doc.fillColor(BRAND_COLOR).fontSize(10).font('Helvetica-Bold').text('METER READINGS', 54, meterY + 4);

  const readings = [
    ['Previous Reading', `${bill.previousReading ?? '—'} kWh`],
    ['Current Reading',  `${bill.currentReading  ?? '—'} kWh`],
    ['Units Consumed',   `${bill.unitsConsumed ?? bill.units ?? '—'} kWh`],
  ];
  readings.forEach(([label, value], i) => {
    const rx = 50 + i * (PAGE_WIDTH / 3);
    doc.rect(rx, meterY + 20, PAGE_WIDTH / 3 - 4, 40).fill(i % 2 === 0 ? '#f9fafb' : '#ffffff').stroke('#e5e7eb');
    doc.fillColor('#6b7280').fontSize(8).font('Helvetica').text(label, rx + 6, meterY + 26);
    doc.fillColor('#111827').fontSize(14).font('Helvetica-Bold').text(value, rx + 6, meterY + 38);
  });

  // ── Charges Breakdown ─────────────────────────────────────────────────────
  const chargeY = meterY + 68;
  doc.rect(50, chargeY, PAGE_WIDTH, 18).fill(LIGHT_BG);
  doc.fillColor(BRAND_COLOR).fontSize(10).font('Helvetica-Bold').text('CHARGES BREAKDOWN', 54, chargeY + 4);

  const tableTop = chargeY + 24;
  // Table header
  doc.rect(50, tableTop, PAGE_WIDTH, 18).fill(BRAND_COLOR);
  doc.fillColor('white').fontSize(9).font('Helvetica-Bold')
     .text('Description', 56, tableTop + 5)
     .text('Calculation', 260, tableTop + 5)
     .text('Amount (₹)', 430, tableTop + 5);

  const uConsumed = bill.unitsConsumed ?? bill.units ?? 0;
  const rate      = bill.ratePerUnit   ?? 6.5;
  const fixed     = bill.fixedCharge   ?? 80;
  const energyCh  = bill.energyCharge  ?? Math.round(uConsumed * rate);
  const taxAmt    = bill.tax           ?? Math.round(energyCh * (bill.taxRate ?? 5) / 100);
  const taxRatePct = bill.taxRate ?? 5;

  const rows = [
    ['Energy Charges',    `${uConsumed} kWh × ₹${rate}/unit`,          `₹${energyCh.toLocaleString('en-IN')}`],
    ['Fixed Charges',     'Monthly fixed charge',                        `₹${fixed.toLocaleString('en-IN')}`],
    [`GST / Tax (${taxRatePct}%)`, `${taxRatePct}% on energy charges`, `₹${taxAmt.toLocaleString('en-IN')}`],
  ];

  rows.forEach(([desc, calc, amt], i) => {
    const ry = tableTop + 18 + i * 22;
    doc.rect(50, ry, PAGE_WIDTH, 22).fill(i % 2 === 0 ? '#f9fafb' : 'white').stroke('#e5e7eb');
    doc.fillColor('#374151').fontSize(9).font('Helvetica')
       .text(desc, 56, ry + 7)
       .text(calc, 260, ry + 7)
       .text(amt, 430, ry + 7);
  });

  // Total row
  const totalY = tableTop + 18 + rows.length * 22;
  doc.rect(50, totalY, PAGE_WIDTH, 28).fill(ACCENT_COLOR);
  doc.fillColor('white').fontSize(12).font('Helvetica-Bold')
     .text('TOTAL AMOUNT PAYABLE', 56, totalY + 8)
     .text(`₹${bill.amount.toLocaleString('en-IN')}`, 0, totalY + 8, { align: 'right', width: PAGE_WIDTH + 50 });

  // ── Payment Info (if paid) ─────────────────────────────────────────────────
  if (bill.status === 'paid') {
    const paidY = totalY + 38;
    doc.rect(50, paidY, PAGE_WIDTH, 50).fill('#f0fdf4').stroke('#16a34a');
    doc.fillColor('#16a34a').fontSize(11).font('Helvetica-Bold').text('✓ PAYMENT RECEIVED', 60, paidY + 8);
    doc.fillColor('#374151').fontSize(9).font('Helvetica')
       .text(`Paid On: ${bill.paidAt ? new Date(bill.paidAt).toLocaleDateString('en-IN') : 'N/A'}`, 60, paidY + 24)
       .text(`Method: ${bill.paymentMethod || 'N/A'}   |   Transaction Ref: ${bill.transactionRef || bill.razorpayPaymentId || 'N/A'}`, 60, paidY + 36);
  }

  // ── Footer ─────────────────────────────────────────────────────────────────
  const footerY = doc.page.height - 70;
  doc.rect(50, footerY, PAGE_WIDTH, 1).fill('#e5e7eb');
  doc.fillColor('#9ca3af').fontSize(8).font('Helvetica')
     .text('This is a computer-generated bill and does not require a physical signature.', 50, footerY + 8, { align: 'center', width: PAGE_WIDTH })
     .text('For queries: helpdesk@jbvnl.co.in  |  Toll-Free: 1800-345-6789', 50, footerY + 20, { align: 'center', width: PAGE_WIDTH })
     .text(`Generated: ${new Date().toLocaleString('en-IN')}  |  JBVNL Smart Portal © ${new Date().getFullYear()}`, 50, footerY + 32, { align: 'center', width: PAGE_WIDTH });

  doc.end();
};

module.exports = { generateBillPdf };
