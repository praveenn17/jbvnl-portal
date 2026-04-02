const Bill = require('../models/Bill');
const User = require('../models/User');
const Complaint = require('../models/Complaint');

// @desc    Get Manager Dashboard Stats
// @route   GET /api/stats/manager
// @access  Private/Admin
const getManagerStats = async (req, res) => {
  try {
    // 1. Total Revenue from paid bills
    const bills = await Bill.find({ status: 'paid' });
    const revenue = bills.reduce((acc, bill) => acc + bill.amount, 0);

    // 2. Total Consumers
    const totalUsers = await User.countDocuments({ role: 'consumer' });

    // 3. Pending Complaints
    const pendingComplaints = await Complaint.countDocuments({ 
      status: { $nin: ['resolved', 'closed'] } 
    });

    // 4. Monthly Statistics (Optional bonus)
    // Here we could add more complex aggregation if needed

    res.json({
      revenue,
      totalUsers,
      pendingComplaints
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getManagerStats
};
