const Bill = require('../models/Bill');
const { logAudit } = require('../utils/auditLogger');

// @desc    Get all bills for a consumer
// @route   GET /api/bills/:consumerNumber
// @access  Private
const getBills = async (req, res) => {
  try {
    // Security check: Consumer can only view their own bills
    if (req.user.role === 'consumer' && req.user.consumerNumber !== req.params.consumerNumber) {
      return res.status(403).json({ message: 'Not authorized to view these bills' });
    }

    const bills = await Bill.find({ consumerNumber: req.params.consumerNumber });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get bill by ID
// @route   GET /api/bills/detail/:id
// @access  Private
const getBillById = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Security check: Consumer can only view their own bill
    if (req.user.role === 'consumer' && req.user.consumerNumber !== bill.consumerNumber) {
      return res.status(403).json({ message: 'Not authorized to view this bill' });
    }

    // Optional: Log bill view/download
    logAudit({
      action: 'BILL_DOWNLOADED',
      message: `Consumer viewed/downloaded bill ${bill.billNumber}`,
      actor: req.user._id,
      actorName: req.user.name,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      targetType: 'bill',
      targetId: bill._id,
      targetLabel: bill.billNumber,
      severity: 'info',
    });

    res.json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// @desc    Create a bill (Admin/Manager only)
// @route   POST /api/bills
// @access  Private/Admin
const createBill = async (req, res) => {
  const { consumerNumber, billNumber, billingPeriod, dueDate, amount, units } = req.body;

  try {
    const bill = new Bill({
      consumerNumber,
      billNumber,
      billingPeriod,
      dueDate,
      amount,
      units,
    });

    const createdBill = await bill.save();

    logAudit({
      action: 'BILL_CREATED',
      message: `Admin/Manager created bill ${createdBill.billNumber}`,
      actor: req.user._id,
      actorName: req.user.name,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      targetType: 'bill',
      targetId: createdBill._id,
      targetLabel: createdBill.billNumber,
      metadata: { amount, units },
      severity: 'info',
    });

    res.status(201).json(createdBill);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Download/Print Bill PDF
// @route   GET /api/bills/:id/download
// @access  Private
const downloadBillPdf = async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);
    if (!bill) {
      return res.status(404).send('Bill not found');
    }

    if (req.user.role === 'consumer' && req.user.consumerNumber !== bill.consumerNumber) {
      return res.status(403).send('Not authorized to download this bill');
    }

    // Optional: Log bill download
    logAudit({
      action: 'BILL_PDF_DOWNLOADED',
      message: `Consumer downloaded bill ${bill.billNumber}`,
      actor: req.user._id,
      actorName: req.user.name,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      targetType: 'bill',
      targetId: bill._id,
      targetLabel: bill.billNumber,
      severity: 'info',
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bill - ${bill.billNumber}</title>
          <style>
              body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
              .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 20px; margin-bottom: 20px; }
              .logo { font-size: 24px; font-weight: bold; color: #2563eb; }
              .sub-logo { font-size: 14px; color: #666; }
              .details-container { display: flex; justify-content: space-between; margin-bottom: 30px; }
              .details-col { width: 45%; }
              .details-col p { margin: 5px 0; }
              .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              .table th, .table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              .table th { background-color: #f8fafc; font-weight: bold; }
              .total-row { font-size: 18px; font-weight: bold; background-color: #eff6ff; }
              .footer { text-align: center; margin-top: 50px; font-size: 12px; color: #888; }
          </style>
      </head>
      <body onload="window.print()">
          <div class="header">
              <div class="logo">JBVNL Smart Portal</div>
              <div class="sub-logo">Electricity Bill Invoice</div>
          </div>
          
          <div class="details-container">
              <div class="details-col">
                  <h3>Consumer Details</h3>
                  <p><strong>Name:</strong> ${req.user.name}</p>
                  <p><strong>Consumer No:</strong> ${bill.consumerNumber}</p>
                  <p><strong>Address:</strong> ${req.user.address || 'N/A'}</p>
              </div>
              <div class="details-col">
                  <h3>Bill Details</h3>
                  <p><strong>Bill No:</strong> ${bill.billNumber}</p>
                  <p><strong>Billing Period:</strong> ${bill.billingPeriod}</p>
                  <p><strong>Due Date:</strong> ${new Date(bill.dueDate).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> ${bill.status.toUpperCase()}</p>
              </div>
          </div>

          <table class="table">
              <thead>
                  <tr>
                      <th>Description</th>
                      <th>Value</th>
                  </tr>
              </thead>
              <tbody>
                  <tr>
                      <td>Units Consumed</td>
                      <td>${bill.units} kWh</td>
                  </tr>
                  <tr>
                      <td>Current Amount</td>
                      <td>₹${bill.amount.toLocaleString()}</td>
                  </tr>
                  <tr class="total-row">
                      <td>Total Payable</td>
                      <td>₹${bill.amount.toLocaleString()}</td>
                  </tr>
              </tbody>
          </table>

          <div class="footer">
              <p>This is a computer-generated invoice and does not require a physical signature.</p>
              <p>&copy; ${new Date().getFullYear()} JBVNL Smart Portal. All rights reserved.</p>
          </div>
      </body>
      </html>
    `;

    res.send(htmlContent);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

module.exports = {
  getBills,
  getBillById,
  createBill,
  downloadBillPdf,
};
