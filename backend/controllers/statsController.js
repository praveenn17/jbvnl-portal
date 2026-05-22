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

// @desc    Get All Dashboard Stats
// @route   GET /api/stats/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const role = req.user.role;
    
    // Aggregation placeholders
    let stats = {};

    if (role === 'admin') {
      const bills = await Bill.find({ status: 'paid' });
      const revenue = bills.reduce((acc, bill) => acc + bill.amount, 0);
      const totalUsers = await User.countDocuments({ role: 'consumer' });
      const activeComplaints = await Complaint.countDocuments({ status: { $nin: ['resolved', 'closed'] } });
      const pendingApprovals = await User.countDocuments({ status: 'pending' });

      // Calculate mock monthly revenue distribution based on real total revenue 
      // (as a safe fallback since we don't have months of real data yet)
      const monthlyRevenue = [
        { month: 'Oct', revenue: parseFloat((revenue * 0.15 / 100000).toFixed(1)) },
        { month: 'Nov', revenue: parseFloat((revenue * 0.18 / 100000).toFixed(1)) },
        { month: 'Dec', revenue: parseFloat((revenue * 0.20 / 100000).toFixed(1)) },
        { month: 'Jan', revenue: parseFloat((revenue * 0.19 / 100000).toFixed(1)) },
        { month: 'Feb', revenue: parseFloat((revenue * 0.22 / 100000).toFixed(1)) },
        { month: 'Mar', revenue: parseFloat((revenue * 0.25 / 100000).toFixed(1)) },
      ];

      // Calculate complaints by category
      const categories = ['Power Outage', 'Billing', 'Technical', 'New Connection'];
      const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e'];
      const complaintsByCategory = await Promise.all(categories.map(async (cat, i) => {
        const count = await Complaint.countDocuments({ category: cat, status: { $nin: ['resolved', 'closed'] } });
        return { name: cat, value: count, color: colors[i] };
      }));

      stats = {
        revenue,
        totalUsers,
        activeComplaints,
        pendingApprovals,
        monthlyRevenue,
        complaintsByCategory
      };
    } else if (role === 'manager') {
      const assignedComplaints = await Complaint.countDocuments({ assignedTo: req.user._id });
      const inProgressComplaints = await Complaint.countDocuments({ assignedTo: req.user._id, status: 'in_progress' });
      const resolvedComplaints = await Complaint.countDocuments({ assignedTo: req.user._id, status: 'resolved' });
      const urgentComplaints = await Complaint.countDocuments({ assignedTo: req.user._id, priority: 'urgent', status: { $nin: ['resolved', 'closed'] } });

      stats = { assignedComplaints, inProgressComplaints, resolvedComplaints, urgentComplaints };
    } else if (role === 'consumer') {
      const myComplaints = await Complaint.countDocuments({ consumerNumber: req.user.consumerNumber });
      const openComplaints = await Complaint.countDocuments({ consumerNumber: req.user.consumerNumber, status: { $nin: ['resolved', 'closed'] } });
      const resolvedComplaints = await Complaint.countDocuments({ consumerNumber: req.user.consumerNumber, status: 'resolved' });
      
      const bills = await Bill.find({ consumerNumber: req.user.consumerNumber }).sort({ dueDate: -1 });
      
      const latestBill = bills.length > 0 ? bills[0] : null;
      const hasPendingBills = bills.some(b => b.status === 'pending' || b.status === 'overdue');

      const currentBillAmount = latestBill ? latestBill.amount : 0;
      const unitsConsumed = latestBill ? latestBill.units : 0;
      const paymentStatus = hasPendingBills ? 'Pending' : (bills.length > 0 ? 'Up to Date' : 'No Data');

      stats = { 
        myComplaints, 
        openComplaints, 
        resolvedComplaints,
        activeComplaints: openComplaints,
        currentBillAmount,
        unitsConsumed,
        paymentStatus,
        latestBillStatus: latestBill ? latestBill.status : null
      };
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getManagerStats,
  getDashboardStats
};
